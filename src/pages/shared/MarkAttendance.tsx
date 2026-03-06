import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, Loader2 } from 'lucide-react';
import * as faceapi from 'face-api.js';
import { getStaff, markAttendanceRecord } from '@/utils/attendance';
import { toast } from 'sonner';

const MODELS_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';

const MarkAttendance: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastDetected, setLastDetected] = useState<string | null>(null);
  const [detectionCooldown, setDetectionCooldown] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadModels = async () => {
      setLoading(true);
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODELS_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error('Failed to load face-api models:', err);
        toast.error('Failed to load face recognition models. Please refresh.');
      }
      setLoading(false);
    };
    loadModels();
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      toast.error('Unable to access camera. Please grant camera permission.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const detectFaces = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) return;
    const video = videoRef.current;
    if (video.readyState !== 4) return;

    const detections = await faceapi
      .detectAllFaces(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
      .withFaceLandmarks()
      .withFaceDescriptors();

    const canvas = canvasRef.current;
    const dims = faceapi.matchDimensions(canvas, video, true);
    faceapi.draw.drawDetections(canvas, faceapi.resizeResults(detections, dims));

    if (detections.length === 0) return;

    const staff = getStaff();
    if (staff.length === 0) return;

    const labeledDescriptors = staff
      .filter(s => s.faceDescriptors && s.faceDescriptors.length > 0)
      .map(s => new faceapi.LabeledFaceDescriptors(
        s.id,
        s.faceDescriptors.map(d => new Float32Array(d))
      ));

    if (labeledDescriptors.length === 0) return;

    const matcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5);

    for (const detection of detections) {
      const match = matcher.findBestMatch(detection.descriptor);
      if (match.label !== 'unknown') {
        const staffMember = staff.find(s => s.id === match.label);
        if (staffMember && !detectionCooldown.has(staffMember.id)) {
          const result = markAttendanceRecord(staffMember.id, staffMember.name);
          setLastDetected(staffMember.name);
          toast.success(
            `${result.type === 'checkin' ? '✅ Check In' : '🔴 Check Out'}: ${result.name}`,
            { duration: 4000 }
          );
          setDetectionCooldown(prev => new Set([...prev, staffMember.id]));
          setTimeout(() => {
            setDetectionCooldown(prev => {
              const next = new Set(prev);
              next.delete(staffMember.id);
              return next;
            });
          }, 10000);
        }
      }
    }
  }, [modelsLoaded, detectionCooldown]);

  const handleStart = async () => {
    await startCamera();
    setIsRunning(true);
    intervalRef.current = window.setInterval(detectFaces, 2000);
  };

  const handleStop = () => {
    stopCamera();
    setIsRunning(false);
    setLastDetected(null);
    setDetectionCooldown(new Set());
  };

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-3xl font-bold">Mark Attendance</h2>
          <p className="text-muted-foreground mt-1">Face recognition based attendance system</p>
        </div>
        {!isRunning ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            disabled={!modelsLoaded || loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-heading font-semibold text-primary-foreground disabled:opacity-50"
            style={{ background: 'var(--gradient-primary)' }}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
            {loading ? 'Loading Models...' : 'Start Attendance'}
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStop}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-heading font-semibold bg-destructive text-destructive-foreground"
          >
            <CameraOff size={20} />
            Stop Attendance
          </motion.button>
        )}
      </div>

      <div className="glass rounded-2xl p-6 overflow-hidden">
        <div className="relative aspect-video max-w-2xl mx-auto rounded-xl overflow-hidden bg-muted/30">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          {!isRunning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-3">
                <Camera size={48} className="mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Click "Start Attendance" to begin</p>
              </div>
            </div>
          )}
          {isRunning && (
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
              <span className="text-sm font-medium text-foreground bg-card/80 px-2 py-1 rounded-lg">Recording</span>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {lastDetected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass rounded-2xl p-6 text-center"
          >
            <p className="text-muted-foreground text-sm">Last Detected</p>
            <p className="font-heading text-2xl font-bold gradient-text">{lastDetected}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarkAttendance;
