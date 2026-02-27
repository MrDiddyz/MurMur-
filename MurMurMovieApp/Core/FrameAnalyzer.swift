import Foundation
import SwiftUI

final class FrameAnalyzer: ObservableObject {
    @Published var fps: Int = 24
    @Published var moodScore: Double = 0.5

    func ingest(frameTimestamp: Date = .now) {
        _ = frameTimestamp
        moodScore = min(1.0, moodScore + 0.02)
    }
}
