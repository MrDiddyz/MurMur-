import SwiftUI

struct CameraView: View {
    @EnvironmentObject private var cameraManager: CameraManager

    var body: some View {
        RoundedRectangle(cornerRadius: 20)
            .fill(.black.opacity(0.88))
            .overlay {
                VStack(spacing: 8) {
                    Image(systemName: "video.fill")
                        .font(.system(size: 40))
                        .foregroundStyle(.white)
                    Text(cameraManager.isRunning ? "Camera Live" : "Camera Offline")
                        .foregroundStyle(.white.opacity(0.9))
                }
            }
            .frame(height: 280)
            .accessibilityLabel("Camera preview")
    }
}

#Preview {
    CameraView()
        .environmentObject(CameraManager())
}
