import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var cameraManager: CameraManager
    @EnvironmentObject private var frameAnalyzer: FrameAnalyzer
    @EnvironmentObject private var emotionDirector: EmotionDirector
    @EnvironmentObject private var learningEngine: LearningEngine

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                ZStack(alignment: .topLeading) {
                    CameraView()
                    OverlayHUD()
                        .padding(12)
                }

                ControlPanelView()

                HStack {
                    Text("Adaptation: \(Int(learningEngine.adaptationLevel * 100))%")
                    Spacer()
                    Button(cameraManager.isRunning ? "Stop" : "Start") {
                        cameraManager.isRunning ? cameraManager.stop() : cameraManager.start()
                        frameAnalyzer.ingest()
                        emotionDirector.updateBeat(from: frameAnalyzer)
                    }
                }
                .font(.footnote.weight(.medium))
            }
            .padding()
            .navigationTitle("MurMur Movie")
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(CameraManager())
        .environmentObject(FilterEngine())
        .environmentObject(FrameAnalyzer())
        .environmentObject(EmotionDirector())
        .environmentObject(LearningEngine())
}
