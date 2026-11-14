# System Boundaries & Hardware Limitations

## 1. Critical Safety & Mobility Boundaries

> [!CAUTION]
> **SenseWeave is an environmental awareness and social-context assistant. It is strictly NOT an autonomous mobility aid.**

1. **Never Replaces Mobility Aids**: SenseWeave must never be used to replace a white cane, guide dog, human sighted guide, or formal Orientation and Mobility (O&M) training.
2. **Never for Road Crossing or Hazard Avoidance**: The system cannot guarantee detection of moving vehicles, drop-offs, curbs, stairs, low-hanging obstacles, or rapid hazards. It must never be used to guide road crossing or hazard navigation.
3. **No Safety Guarantees**: Camera fields of view are limited, sensors can be occluded, lighting varies, and network connectivity can fluctuate. Never assume an undetected object is absent.

---

## 2. Hardware Sensory Limitations

### Smartphone Inertial Vibration Motors vs Tactile Arrays
- Most modern smartphones possess a single internal eccentric rotating mass (ERM) or linear resonant actuator (LRA) haptic motor.
- **Physical Reality**: A single vibration motor vibrates the entire chassis of the phone uniformly. It cannot convey physical direction (e.g., left vs right) across the user's skin.
- **SenseWeave's Design**: We use **temporal rhythmic patterns** (e.g., single short, double short, rapid pulses) to encode event types, rather than misleading users by claiming physical directional localization.
- External multi-actuator tactile displays (such as directional haptic belts or sleeve arrays) will only be indicated when an authorized external device is physically paired and validated.

### Monocular Camera Limitations & Depth Ambiguity
- Standard smartphone and webcam optics capture 2D monocular images without true stereoscopic disparity or time-of-flight LiDAR depth mapping.
- **Spatial Estimates**: SenseWeave reports only camera-relative horizontal angular zones (`camera_left`, `camera_center`, `camera_right`) and line of sight (`ahead`).
- It does **not** estimate physical metric distance, depth, or velocity from 2D frames, preventing hazardous false assumptions.

---

## 3. Disconnection & Network Continuity

In dynamic environments, cellular or Wi-Fi connectivity may degrade or drop:
- **Disconnection Marker**: When WebSocket connectivity drops, SenseWeave immediately emits a high-priority warning cue: `"Connection to environmental assistant interrupted"`.
- **Haptic Disconnection Signature**: The haptic engine triggers the distinctive `warning` pattern (`[150, 50, 150, 50, 200] ms`).
- **Resumption Continuity**: When reconnected, the system announces: `"Connection restored"` with a temporal gap marker so the user knows events may have occurred during the outage that were not captured.

---

## 4. Multimodal Model & Latency Limitations

- **Inference Latency**: Real-time cloud multimodal processing via Gemini Live introduces an approximate round-trip latency of 400ms–900ms depending on cellular network bandwidth.
- **Local Edge Offsetting**: The client-side optical motion detector operates at 0ms network latency to deliver instantaneous hand-raise and movement tactile cues before cloud inference returns.
- **Stochastic Output**: Multimodal LLMs may occasionally misclassify subtle environmental sounds or ambiguous movements. Certainty ratings (`confirmed`, `likely`, `uncertain`) are explicitly attached to every event so users can calibrate reliance.

---

## 5. Privacy & Social Respect Boundaries

- **No Facial Recognition**: The system has no capability to recognize or store human faces.
- **No Voiceprinting**: Speakers are labeled strictly with temporary identifiers (`Speaker A`, `Speaker B`) within the active session.
- **No Emotion or Intent Inference**: The system observes physical actions (e.g., "A person raised one hand") and will never claim to know social motives (e.g., "Someone wants to ask a question").
