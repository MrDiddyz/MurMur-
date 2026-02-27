import SwiftUI

@main
struct MurMurMovieApp: App {
    @StateObject private var cameraManager = CameraManager()
    @StateObject private var filterEngine = FilterEngine()
    @StateObject private var frameAnalyzer = FrameAnalyzer()
    @StateObject private var emotionDirector = EmotionDirector()
    @StateObject private var learningEngine = LearningEngine()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(cameraManager)
                .environmentObject(filterEngine)
                .environmentObject(frameAnalyzer)
                .environmentObject(emotionDirector)
                .environmentObject(learningEngine)
        }
    }
}
