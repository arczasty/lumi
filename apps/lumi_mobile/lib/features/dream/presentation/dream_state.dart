import 'package:flutter_riverpod/flutter_riverpod.dart';
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

  DreamController(this._recorderService)
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
          status: RecordingState.analyzing, // Move to uploading phase
          filePath: path
        );
        // TODO: Trigger upload to Firebase here
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
  return DreamController(ref.watch(audioRecorderProvider));
});
