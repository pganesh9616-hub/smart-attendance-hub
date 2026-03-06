import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Camera, Check, Loader2 } from 'lucide-react';
import * as faceapi from 'face-api.js';
import { getStaff, saveStaff, StaffMember } from '@/utils/attendance';
import { toast } from 'sonner';

const MODELS_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';

const AddStaff: React.FC = () => {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [samples, setSamples] = useState<number[][]>([]);
  const [capturing, setCapturing] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const loadModels = async () => {
    try {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODELS_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_URL),
      ]);
      setModelsReady(true);
    } catch (err) {
      toast.error('Failed to load face models');
    }
  };

  const startCapture = async () => {
    setLoading(true);
    if (!modelsReady) await loadModels();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setCapturing(true);
      setSamples([]);
    } catch (err) {
      toast.error('Camera access denied');
    }
    setLoading(false);
  };

  const captureSample = useCallback(async () => {
    if (!videoRef.current || !modelsReady) return;
    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      setSamples(prev => [...prev, Array.from(detection.descriptor)]);
      toast.success(`Sample ${samples.length + 1}/10 captured!`);
    } else {
      toast.error('No face detected. Please face the camera.');
    }
  }, [modelsReady, samples.length]);

  const stopCapture = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCapturing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (samples.length < 5) {
      toast.error('Please capture at least 5 face samples');
      return;
    }
    if (!name || !username || !password) {
      toast.error('Please fill all required fields');
      return;
    }

    const staff = getStaff();
    if (staff.find(s => s.username === username)) {
      toast.error('Username already exists');
      return;
    }

    const newStaff: StaffMember = {
      id: crypto.randomUUID(),
      name, department, designation, username, password,
      faceDescriptors: samples,
      createdAt: new Date().toISOString(),
    };

    staff.push(newStaff);
    saveStaff(staff);
    stopCapture();
    toast.success(`Staff member "${name}" added successfully!`);
    setName(''); setDepartment(''); setDesignation('');
    setUsername(''); setPassword(''); setSamples([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl font-bold">Add Staff</h2>
        <p className="text-muted-foreground mt-1">Register new staff with face recognition</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Details Form */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="font-heading text-lg font-semibold">Staff Details</h3>
          {[
            { label: 'Full Name *', value: name, set: setName, type: 'text' },
            { label: 'Department', value: department, set: setDepartment, type: 'text' },
            { label: 'Designation', value: designation, set: setDesignation, type: 'text' },
            { label: 'Username *', value: username, set: setUsername, type: 'text' },
            { label: 'Password *', value: password, set: setPassword, type: 'password' },
          ].map(field => (
            <div key={field.label} className="space-y-1">
              <label className="text-sm text-muted-foreground">{field.label}</label>
              <input
                type={field.type}
                value={field.value}
                onChange={e => field.set(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                required={field.label.includes('*')}
              />
            </div>
          ))}
        </div>

        {/* Face Capture */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-semibold">Face Samples</h3>
            <span className="text-sm font-medium px-3 py-1 rounded-full bg-primary/20 text-primary">{samples.length}/10</span>
          </div>

          <div className="aspect-video rounded-xl overflow-hidden bg-muted/30 relative">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            {!capturing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera size={48} className="text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {!capturing ? (
              <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startCapture}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-heading font-semibold text-primary-foreground"
                style={{ background: 'var(--gradient-primary)' }}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                Start Camera
              </motion.button>
            ) : (
              <>
                <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={captureSample}
                  disabled={samples.length >= 10}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-heading font-semibold text-primary-foreground disabled:opacity-50"
                  style={{ background: 'var(--gradient-primary)' }}>
                  <Camera size={18} />
                  Capture ({samples.length}/10)
                </motion.button>
                <button type="button" onClick={stopCapture} className="px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-medium">
                  Stop
                </button>
              </>
            )}
          </div>

          {/* Progress */}
          <div className="flex gap-1.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={`h-2 flex-1 rounded-full transition-all ${i < samples.length ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="lg:col-span-2">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl font-heading font-semibold text-primary-foreground flex items-center justify-center gap-2"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <UserPlus size={20} />
            Add Staff Member
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default AddStaff;
