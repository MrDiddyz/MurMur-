import SwiftUI
import CoreVideo
import CoreImage

struct ContentView: View {
    @StateObject private var tello = TelloClient()
    @StateObject private var video = VideoReceiver()
    @StateObject private var controller = FollowController()

    private let follower = VisionPersonFollower()

    @State private var isFollowing = false
    @State private var debugText: String = "idle"

    var body: some View {
        VStack(spacing: 12) {
            Text("Tello Follow Person (MVP)").font(.headline)
            Text("Link: \(tello.status)")
            Text(tello.lastResponse).font(.caption)

            HStack {
                Button("Connect") {
                    tello.connect()
                    tello.startSDK()
                    try? video.start()
                }
                Button("Takeoff") { tello.takeoff() }
                Button("Land") { tello.land() }
            }

            Toggle("Follow Person", isOn: $isFollowing)
                .padding(.horizontal)

            Text(debugText).font(.caption).padding(.top, 6)

            Divider()

            Button("STOP") { tello.stop() }
                .foregroundStyle(.red)
        }
        .padding()
        .onAppear {
            // Wire frames → Vision → Controller → RC
            video.decoder.onFrame = { pb in
                follower.process(pixelBuffer: pb)
            }

            follower.onTarget = { box, conf in
                guard isFollowing else { return }
                let rc = controller.updateTarget(box: box)
                tello.rc(lr: rc.lr, fb: rc.fb, ud: rc.ud, yaw: rc.yaw)
                DispatchQueue.main.async {
                    debugText = String(format: "Target conf=%.2f box=(%.2f,%.2f,%.2f,%.2f) rc=%d,%d,%d,%d",
                                       conf, box.origin.x, box.origin.y, box.size.width, box.size.height,
                                       rc.lr, rc.fb, rc.ud, rc.yaw)
                }
            }

            follower.onLost = {
                guard isFollowing else { return }
                let rc = controller.lostFailsafe()
                tello.rc(lr: rc.lr, fb: rc.fb, ud: rc.ud, yaw: rc.yaw)
                DispatchQueue.main.async {
                    debugText = "Target lost → STOP"
                }
            }
        }
        .onChange(of: isFollowing) { on in
            if !on {
                follower.reset()
                tello.stop()
            }
        }
    }
}
