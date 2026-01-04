import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { 
  ArrowLeft, 
  ArrowRight, 
  MapPin, 
  Camera, 
  CheckCircle,
  X,
  Trash2,
  AlertTriangle,
  Zap,
  Droplets,
  Trees,
  Truck,
  Shield,
  Loader2,
  FileText
} from 'lucide-react';
import { useIssue } from '../contexts/IssueContext';
import { useLocation } from '../contexts/LocationContext';
import toast from 'react-hot-toast';

const ReportIssuePage = () => {
  const navigate = useNavigate();
  const { createIssue } = useIssue();
  const { selectedLocation, getAddressFromCoords } = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationAddress, setLocationAddress] = useState('');
  const [direction, setDirection] = useState(0);
  const [enableSubmit, setEnableSubmit] = useState(false);

  // Prevent double-click accidental submission
  useEffect(() => {
    if (currentStep === 5) {
      const timer = setTimeout(() => setEnableSubmit(true), 500);
      return () => clearTimeout(timer);
    } else {
      setEnableSubmit(false);
    }
  }, [currentStep]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  
  // Watch values for preview
  const selectedCategory = watch('category');

  const categories = [
    { value: 'roads', label: 'Roads', icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
    { value: 'lighting', label: 'Lights', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    { value: 'water', label: 'Water', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
    { value: 'cleanliness', label: 'Garbage', icon: Truck, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },
    { value: 'obstructions', label: 'Obstruction', icon: Trees, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
    { value: 'safety', label: 'Safety', icon: Shield, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
  ];

  const totalSteps = 5;

  useEffect(() => {
    if (selectedLocation) {
      getAddressFromCoords(selectedLocation.lat, selectedLocation.lng)
        .then(address => setLocationAddress(address));
    }
  }, [selectedLocation]);

  const onDrop = (acceptedFiles) => {
    const newImages = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages].slice(0, 5));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 5
  });

  const nextStep = () => {
    if (currentStep < totalSteps) {
      // Step 1 Validation: Category
      if (currentStep === 1 && !selectedCategory) {
        toast.error('Please select a category');
        return;
      }

      // Step 2 Validation: Title & Description
      if (currentStep === 2) {
        const title = watch('title');
        const description = watch('description');
        
        if (!title || !title.trim()) {
           toast.error('Title is required');
           return;
        }
        if (!description || !description.trim()) {
           toast.error('Description is required');
           return;
        }
      }

      // Step 3 Validation: Location
      if (currentStep === 3) {
         if (!selectedLocation) {
            toast.error('Please confirm location');
            return;
         }
      }

      setDirection(1);
      setCurrentStep(c => c + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep(c => c - 1);
    } else {
      navigate(-1);
    }
  };

  const onSubmit = async (data) => {
    if (!selectedLocation) {
      toast.error('Please confirm location');
      setCurrentStep(3);
      return;
    }

    setIsSubmitting(true);
    try {
      const issueData = {
        ...data,
        location: selectedLocation,
        images: images.map(img => img.file),
      };

      const result = await createIssue(issueData);
      if (result.success) {
        toast.success('Reported successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Failed to report issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (direction) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };

  return (
    <div className="fixed inset-0 z-[60] lg:static lg:z-auto min-h-[100dvh] lg:min-h-screen bg-slate-50 flex flex-col font-sans overflow-hidden lg:overflow-visible">
      {/* Animated Background Blob */}
      <div className="absolute top-0 right-[-20%] w-[80%] h-[50%] rounded-full bg-blue-400/20 blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 left-[-10%] w-[60%] h-[40%] rounded-full bg-indigo-400/20 blur-3xl animate-pulse pointer-events-none" />

      <div className="w-full max-w-3xl mx-auto flex flex-col h-full flex-1">
        {/* Top Navigation & Progress */}
        <div className="relative z-20 px-6 pt-6 pb-2 bg-white/80 backdrop-blur-md lg:rounded-b-3xl shrink-0">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevStep} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
              <ArrowLeft size={24} className="text-slate-800" />
            </button>
            <span className="font-bold text-slate-800 text-lg">
              {currentStep === 1 && "Select Category"}
              {currentStep === 2 && "Issue Details"}
              {currentStep === 3 && "Confirm Location"}
              {currentStep === 4 && "Add Photos"}
              {currentStep === 5 && "Review Report"}
            </span>
            <div className="w-10" /> {/* Spacer */}
          </div>
          
          {/* Story-style Progress Bars */}
          <div className="flex space-x-1.5 h-1">
            {[...Array(totalSteps)].map((_, i) => (
              <div 
                key={i} 
                className={`flex-1 rounded-full transition-all duration-300 ${
                  i + 1 <= currentStep ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 relative lg:mb-0 z-10 flex flex-col h-full lg:h-auto overflow-hidden lg:overflow-visible">
          
          {/* Scrollable Step Content */}
          <div className="flex-1 lg:flex-none overflow-y-auto lg:overflow-visible scrollbar-hide px-6 pt-6 pb-6 lg:px-0 lg:pb-2 lg:mb-0">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              
              {/* STEP 1: Categories */}
              {currentStep === 1 && (
                <motion.div 
                  key="step1"
                  custom={direction}
                  variants={pageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="h-full"
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {categories.map((cat) => (
                      <label 
                        key={cat.value} 
                        className={`relative flex flex-col items-center justify-center p-6 rounded-3xl border-2 cursor-pointer transition-all duration-200 aspect-square ${
                          selectedCategory === cat.value 
                            ? `${cat.bg} ${cat.border} ring-2 ring-offset-2 ring-blue-500/50 scale-105 shadow-xl` 
                            : 'bg-white border-slate-100 shadow-sm hover:scale-[1.02] hover:border-blue-200'
                        }`}
                      >
                        <input 
                          type="radio" 
                          value={cat.value} 
                          {...register('category')} 
                          className="sr-only" 
                        />
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 text-2xl transition-transform ${
                          selectedCategory === cat.value ? 'bg-white shadow-sm scale-110' : `${cat.bg}`
                        }`}>
                          <cat.icon size={28} className={cat.color} />
                        </div>
                        <span className={`font-bold text-center ${selectedCategory === cat.value ? 'text-slate-900' : 'text-slate-600'}`}>
                          {cat.label}
                        </span>
                        {selectedCategory === cat.value && (
                          <div className="absolute top-3 right-3 text-blue-600">
                            <CheckCircle size={20} fill="currentColor" className="text-white" />
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Details */}
              {currentStep === 2 && (
                <motion.div 
                  key="step2"
                  custom={direction}
                  variants={pageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6"
                >
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Title</label>
                        <input 
                          {...register('title', { required: true })}
                          placeholder="e.g. Broken Streetlight"
                          className="w-full text-xl font-bold text-slate-900 border-b-2 border-slate-100 py-2 focus:border-blue-500 focus:outline-none placeholder:text-slate-300 transition-colors bg-transparent"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Description</label>
                        <textarea 
                          {...register('description', { required: true })}
                          rows={6}
                          placeholder="Describe the issue in detail..."
                          className="w-full text-base text-slate-700 bg-slate-50 rounded-2xl p-4 border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-none transition-all"
                        />
                    </div>
                  </div>

                   <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
                      <span className="font-medium text-slate-700 pl-2">Report Anonymously</span>
                      <input 
                        type="checkbox" 
                        {...register('anonymous')}
                        className="w-6 h-6 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 mr-2" 
                      />
                   </div>
                </motion.div>
              )}

              {/* STEP 3: Location */}
              {currentStep === 3 && (
                <motion.div 
                  key="step3"
                  custom={direction}
                  variants={pageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="flex flex-col items-center justify-center text-center min-h-[40vh]"
                >
                   <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-lg shadow-blue-100">
                      <MapPin size={48} className="text-blue-600" />
                   </div>
                   <h3 className="text-2xl font-bold text-slate-900 mb-2">Confirm Location</h3>
                   <p className="text-slate-500 mb-8 max-w-xs">{locationAddress || 'Detecting location...'}</p>
                   
                   <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 w-full max-w-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3 text-left">
                         <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                            <MapPin size={20} />
                         </div>
                         <div>
                            <p className="font-bold text-slate-900 text-sm">Lat: {selectedLocation?.lat?.toFixed(4)}</p>
                            <p className="font-bold text-slate-900 text-sm">Lng: {selectedLocation?.lng?.toFixed(4)}</p>
                         </div>
                      </div>
                   </div>
                </motion.div>
              )}

               {/* STEP 4: Photos */}
               {currentStep === 4 && (
                <motion.div 
                  key="step4"
                  custom={direction}
                  variants={pageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className=""
                >
                   <div 
                      {...getRootProps()} 
                      className={`border-3 border-dashed rounded-3xl h-64 flex flex-col items-center justify-center transition-all cursor-pointer ${
                         isDragActive ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-slate-100'
                      }`}
                   >
                      <input {...getInputProps()} />
                      <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                         <Camera size={32} className="text-blue-600" />
                      </div>
                      <p className="font-bold text-slate-600 text-lg">Tap to upload photos</p>
                      <p className="text-sm text-slate-400 mt-2">or drag and drop</p>
                   </div>

                   {images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                         {images.map((img, i) => (
                            <motion.div 
                              key={i} 
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="relative aspect-square group"
                            >
                               <img src={img.preview} alt="Upload" className="w-full h-full object-cover rounded-2xl shadow-md" />
                               <button 
                                  type="button"
                                  onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                               >
                                  <X size={16} />
                               </button>
                            </motion.div>
                         ))}
                      </div>
                   )}
                </motion.div>
              )}

               {/* STEP 5: Review */}
               {currentStep === 5 && (
                <motion.div 
                  key="step5"
                  custom={direction}
                  variants={pageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="h-full flex flex-col"
                >
                   <div className="bg-white rounded-3xl p-8 shadow-lg shadow-blue-500/5 border border-slate-100 text-center max-w-lg mx-auto w-full">
                      <div className="inline-flex p-4 bg-blue-50 rounded-2xl text-blue-600 mb-6">
                         <FileText size={40} />
                      </div>
                      <h2 className="text-3xl font-bold text-slate-900 mb-2">Review Details</h2>
                      <p className="text-slate-500 text-base mb-8">Please check your report before submitting.</p>

                      <div className="text-left space-y-4 bg-slate-50 p-6 rounded-2xl">
                         <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Issue</p>
                            <p className="font-bold text-slate-900 text-lg">{watch('title')}</p>
                         </div>
                         <div className="h-px bg-slate-200" />
                         <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Category</p>
                            <div className="flex items-center space-x-2">
                               <span className="capitalize font-medium text-slate-700">{watch('category')}</span>
                            </div>
                         </div>
                         <div className="h-px bg-slate-200" />
                         <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                            <p className="text-sm font-medium text-slate-700 line-clamp-2">{locationAddress}</p>
                         </div>
                      </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Floating Action Dock */}
          <div className="p-6 pb-24 lg:p-0 lg:m-0 bg-white/80 lg:bg-transparent backdrop-blur-xl border-t lg:border-none border-slate-100 shrink-0">
             {currentStep < 5 ? (
                <button 
                   type="button"
                   onClick={nextStep}
                   className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-900/10 active:scale-95 transition-all flex items-center justify-center group"
                >
                   Next Step <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
             ) : (
                <button 
                   type="submit"
                   disabled={isSubmitting || !enableSubmit}
                   className={`w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center ${(!enableSubmit || isSubmitting) ? 'opacity-70 cursor-not-allowed scale-100 active:scale-100' : ''}`}
                >
                   {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : 'Submit Report'}
                </button>
             )}
          </div>
        </form>
      </div>
    </div>  );
};

export default ReportIssuePage;