import SwiftUI

struct OverlayHUD: View {
    @EnvironmentObject private var frameAnalyzer: FrameAnalyzer
    @EnvironmentObject private var emotionDirector: EmotionDirector
    @EnvironmentObject private var filterEngine: FilterEngine

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("FPS: \(frameAnalyzer.fps)")
            Text("Beat: \(emotionDirector.currentBeat)")
            Text("Filter: \(filterEngine.activeFilterName)")
        }
        .font(.caption.weight(.semibold))
        .padding(12)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }
}

#Preview {
    OverlayHUD()
        .environmentObject(FrameAnalyzer())
        .environmentObject(EmotionDirector())
        .environmentObject(FilterEngine())
}
