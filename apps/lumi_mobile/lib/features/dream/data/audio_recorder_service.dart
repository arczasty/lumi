import 'dart:io';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:uuid/uuid.dart';

class AudioRecorderService {
  final Record _recorder = Record();
  
  // Start recording and return the file path
  Future<String> startRecording() async {
    // 1. Check Permissions
    final status = await Permission.microphone.request();
    if (status != PermissionStatus.granted) {
      throw Exception('Microphone permission denied');
    }

    // 2. Prepare File Path
    final directory = await getTemporaryDirectory();
    final fileName = 'dream_${const Uuid().v4()}.m4a';
    final filePath = '${directory.path}/$fileName';

    // 3. Start (AAC is standard for whisper)
    await _recorder.start(
      encoder: AudioEncoder.aacLc,
      path: filePath,
    );

    return filePath;
  }

  Future<String?> stopRecording() async {
    return await _recorder.stop();
  }

  Future<void> cancelRecording() async {
     // If canceled, stop and delete file
     final path = await _recorder.stop();
     if (path != null) {
       final file = File(path);
       if (await file.exists()) {
         await file.delete();
       }
     }
  }
}
