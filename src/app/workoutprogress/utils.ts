// @ts-nocheck

export function getLandmark(landmarks: any, id: any) {
  return landmarks?.[id];
}

export function isVisible(landmark: any) {
  return landmark?.visibility > 0.5;
}

export function chooseSide(left: any, right: any) {
  if (left?.visibility > right?.visibility) {
    return left;
  }
  return right;
}

export function drawLine(ctx, point1, point2, color = "#00FF00", width = 4) {
  if (point1 && point2) {
    ctx.beginPath();
    ctx.moveTo(point1.x * ctx.canvas.width, point1.y * ctx.canvas.height);
    ctx.lineTo(point2.x * ctx.canvas.width, point2.y * ctx.canvas.height);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }
}

export function drawPoint(ctx, point, color = "#FF0000", radius = 5) {
  if (point) {
    ctx.beginPath();
    ctx.arc(
      point.x * ctx.canvas.width,
      point.y * ctx.canvas.height,
      radius,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = color;
    ctx.fill();
  }
}

export function drawBicepPose(ctx: any, landmarks: any, mediaPose: any) {
  const leftShoulder = getLandmark(
    landmarks,
    mediaPose.POSE_LANDMARKS.LEFT_SHOULDER
  );
  const rightShoulder = getLandmark(
    landmarks,
    mediaPose.POSE_LANDMARKS.RIGHT_SHOULDER
  );
  const shoulder = chooseSide(leftShoulder, rightShoulder);

  const leftElbow = getLandmark(landmarks, mediaPose.POSE_LANDMARKS.LEFT_ELBOW);
  const rightElbow = getLandmark(
    landmarks,
    mediaPose.POSE_LANDMARKS.RIGHT_ELBOW
  );
  const elbow = chooseSide(leftElbow, rightElbow);

  const leftWrist = getLandmark(landmarks, mediaPose.POSE_LANDMARKS.LEFT_WRIST);
  const rightWrist = getLandmark(
    landmarks,
    mediaPose.POSE_LANDMARKS.RIGHT_WRIST
  );
  const wrist = chooseSide(leftWrist, rightWrist);
  const leftHip = getLandmark(landmarks, mediaPose.POSE_LANDMARKS.LEFT_HIP);
  const rightHip = getLandmark(landmarks, mediaPose.POSE_LANDMARKS.RIGHT_HIP);
  const hip = chooseSide(leftHip, rightHip);

  drawLine(ctx, shoulder, elbow);
  drawLine(ctx, elbow, wrist);
  //   drawLine(ctx, shoulder, hip);

  drawPoint(ctx, shoulder);
  drawPoint(ctx, elbow);
  drawPoint(ctx, wrist);
}

export function drawPushupPose(ctx: any, landmarks: any, mediaPose: any) {
  const shoulder = chooseSide(
    getLandmark(landmarks, mediaPose.POSE_LANDMARKS.LEFT_SHOULDER),
    getLandmark(landmarks, mediaPose.POSE_LANDMARKS.RIGHT_SHOULDER)
  );
  const elbow = chooseSide(
    getLandmark(landmarks, mediaPose.POSE_LANDMARKS.LEFT_ELBOW),
    getLandmark(landmarks, mediaPose.POSE_LANDMARKS.RIGHT_ELBOW)
  );
  const wrist = chooseSide(
    getLandmark(landmarks, mediaPose.POSE_LANDMARKS.LEFT_WRIST),
    getLandmark(landmarks, mediaPose.POSE_LANDMARKS.RIGHT_WRIST)
  );
  const hip = chooseSide(
    getLandmark(landmarks, mediaPose.POSE_LANDMARKS.LEFT_HIP),
    getLandmark(landmarks, mediaPose.POSE_LANDMARKS.RIGHT_HIP)
  );
  const ankle = chooseSide(
    getLandmark(landmarks, mediaPose.POSE_LANDMARKS.LEFT_ANKLE),
    getLandmark(landmarks, mediaPose.POSE_LANDMARKS.RIGHT_ANKLE)
  );

  drawLine(ctx, shoulder, elbow);
  drawLine(ctx, elbow, wrist);
  drawLine(ctx, shoulder, hip);
  if (ankle) drawLine(ctx, hip, ankle);

  drawPoint(ctx, shoulder);
  drawPoint(ctx, elbow);
  drawPoint(ctx, wrist);
  drawPoint(ctx, hip);
  if (ankle) drawPoint(ctx, ankle);
}

export function drawSquatPose(ctx: any, landmarks: any, mediaPose: any) {
  const shoulder = chooseSide(
    getLandmark(landmarks, mediaPose.POSE_LANDMARKS.LEFT_SHOULDER),
    getLandmark(landmarks, mediaPose.POSE_LANDMARKS.RIGHT_SHOULDER)
  );
  const elbow = chooseSide(
    getLandmark(landmarks, mediaPose.POSE_LANDMARKS.LEFT_ELBOW),
    getLandmark(landmarks, mediaPose.POSE_LANDMARKS.RIGHT_ELBOW)
  );
  const wrist = chooseSide(
    getLandmark(landmarks, mediaPose.POSE_LANDMARKS.LEFT_WRIST),
    getLandmark(landmarks, mediaPose.POSE_LANDMARKS.RIGHT_WRIST)
  );
  const hip = chooseSide(
    getLandmark(landmarks, mediaPose.POSE_LANDMARKS.LEFT_HIP),
    getLandmark(landmarks, mediaPose.POSE_LANDMARKS.RIGHT_HIP)
  );
  const knee = chooseSide(
    getLandmark(landmarks, mediaPose.POSE_LANDMARKS.LEFT_KNEE),
    getLandmark(landmarks, mediaPose.POSE_LANDMARKS.RIGHT_KNEE)
  );
  const ankle = chooseSide(
    getLandmark(landmarks, mediaPose.POSE_LANDMARKS.LEFT_ANKLE),
    getLandmark(landmarks, mediaPose.POSE_LANDMARKS.RIGHT_ANKLE)
  );
  const foot = chooseSide(
    getLandmark(landmarks, mediaPose.POSE_LANDMARKS.LEFT_FOOT_INDEX),
    getLandmark(landmarks, mediaPose.POSE_LANDMARKS.RIGHT_FOOT_INDEX)
  );

  // Draw lines to represent limbs and posture
  drawLine(ctx, shoulder, elbow);
  drawLine(ctx, elbow, wrist);
  drawLine(ctx, shoulder, hip);
  drawLine(ctx, hip, knee);
  drawLine(ctx, knee, ankle);
  drawLine(ctx, ankle, foot);

  // Draw joints
  drawPoint(ctx, shoulder);
  drawPoint(ctx, elbow);
  drawPoint(ctx, wrist);
  drawPoint(ctx, hip);
  drawPoint(ctx, knee);
  drawPoint(ctx, ankle);
  drawPoint(ctx, foot);
}
