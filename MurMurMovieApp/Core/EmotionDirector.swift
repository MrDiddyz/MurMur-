import Foundation
import SwiftUI

final class EmotionDirector: ObservableObject {
    @Published var currentBeat: String = "Warm Intro"
    @Published var confidence: Double = 0.75

    func updateBeat(from analyzer: FrameAnalyzer) {
        currentBeat = analyzer.moodScore > 0.7 ? "Triumphant" : "Reflective"
        confidence = analyzer.moodScore
    }
}
