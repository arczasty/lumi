import 'dart:io';
import 'dart:convert';
import 'package:convex_flutter/convex_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'package:lumi_mobile/core/data/convex_provider.dart';
import 'package:lumi_mobile/features/dream/data/audio_recorder_service.dart';

enum RecordingState { idle, recording, analyzing, error }

class DreamState {
  final RecordingState status;
  final String? filePath;
  final String? errorMessage;
  final double amplitude; // For visualizer

  DreamState({
    required this.status,
    this.filePath,
    this.errorMessage,
    this.amplitude = 0.0,
  });

  DreamState copyWith({
    RecordingState? status,
    String? filePath,
    String? errorMessage,
    double? amplitude,
  }) {
    return DreamState(
      status: status ?? this.status,
      filePath: filePath ?? this.filePath,
      errorMessage: errorMessage ?? this.errorMessage,
      amplitude: amplitude ?? this.amplitude,
    );
  }
}

class DreamController extends StateNotifier<DreamState> {
  final AudioRecorderService _recorderService;
  final ConvexClient _convex;

  DreamController(this._recorderService, this._convex)
      : super(DreamState(status: RecordingState.idle));

  Future<void> startRecording() async {
    try {
      state = state.copyWith(status: RecordingState.recording, errorMessage: null);
      await _recorderService.startRecording();
    } catch (e) {
      state = state.copyWith(
        status: RecordingState.error, 
        errorMessage: "Mic Error: $e"
      );
    }
  }

  Future<void> stopRecording() async {
    try {
      final path = await _recorderService.stopRecording();
      if (path != null) {
        state = state.copyWith(
          status: RecordingState.analyzing,
          filePath: path
        );
        
        // 1. Get Convex Upload URL
        final String uploadUrl = await _convex.mutation("dreams:generateUploadUrl", {});

        // 2. Upload file to Convex Storage
        final file = File(path);
        final bytes = await file.readAsBytes();
        final response = await http.post(
          Uri.parse(uploadUrl),
          headers: {'Content-Type': 'audio/m4a'},
          body: bytes,
        );

        if (response.statusCode != 200) {
          throw Exception("Failed to upload audio to Convex storage");
        }

        // 3. Get the storageId from the response
        final storageData = jsonDecode(response.body);
        final String actualStorageId = storageData['storageId'];

        // 4. Create the initial dream record
        final dreamId = await _convex.mutation("dreams:saveDream", {
          "userId": "guest_traveler",
          "audioStorageId": actualStorageId,
        });

        // 5. Trigger Transcription and AI Analysis (Gemini 1.5 Flash)
        await _convex.action("ai:transcribeAndAnalyze", {
          "dreamId": dreamId,
          "storageId": actualStorageId,
        });

        state = state.copyWith(status: RecordingState.idle);
      } else {
        state = state.copyWith(status: RecordingState.idle);
      }
    } catch (e) {
      state = state.copyWith(status: RecordingState.error, errorMessage: e.toString());
    }
  }
}

final audioRecorderProvider = Provider((ref) => AudioRecorderService());

final dreamControllerProvider = StateNotifierProvider<DreamController, DreamState>((ref) {
  final recorder = ref.watch(audioRecorderProvider);
  final convex = ref.watch(convexClientProvider);
  return DreamController(recorder, convex);
});
