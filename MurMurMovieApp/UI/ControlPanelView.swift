import SwiftUI

struct ControlPanelView: View {
    @EnvironmentObject private var filterEngine: FilterEngine
    @EnvironmentObject private var learningEngine: LearningEngine

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Picker("Scene Mode", selection: $filterEngine.selectedMode) {
                ForEach(SceneMode.allCases) { mode in
                    Text(mode.displayName).tag(mode)
                }
            }
            .pickerStyle(.segmented)

            VStack(alignment: .leading, spacing: 6) {
                Text("Filter Intensity")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Slider(value: $filterEngine.intensity, in: 0...1)
            }

            Button("Reinforce") {
                learningEngine.reinforcePositiveSignal()
            }
            .buttonStyle(.borderedProminent)
        }
    }
}

#Preview {
    ControlPanelView()
        .environmentObject(FilterEngine())
        .environmentObject(LearningEngine())
}
