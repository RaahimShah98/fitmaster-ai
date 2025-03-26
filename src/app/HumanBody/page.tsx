"use client"
// pages/muscle-viewer.tsx
import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import styles from '../styles/MuscleViewer.module.css';

export default function MuscleViewer() {
  const humanRef = useRef(null);
  const [human, setHuman] = useState(null);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Define muscle groups and their corresponding IDs in BioDigital Human
  const muscleGroups = {
    chest: ['pectoralis_major_right', 'pectoralis_major_left', 'pectoralis_minor_right', 'pectoralis_minor_left'],
    bicep: ['biceps_brachii_right', 'biceps_brachii_left'],
    legs: ['quadriceps_right', 'quadriceps_left', 'hamstrings_right', 'hamstrings_left', 'gastrocnemius_right', 'gastrocnemius_left']
  };

  // Load BioDigital Human SDK
  useEffect(() => {
    // Load BioDigital Human SDK script
    const script = document.createElement('script');
    script.src = 'https://developer.biodigital.com/builds/api/2/human-api.min.js';
    script.async = true;
    script.onload = initializeHuman;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Initialize BioDigital Human
  const initializeHuman = () => {
    if (window.HumanAPI && humanRef.current) {
      // Create a new instance of the BioDigital Human
      const humanInstance = new window.HumanAPI({
        container: humanRef.current,
        apikey: process.env.NEXT_PUBLIC_BIODIGITAL_API_KEY, // Replace with your actual API key
        model: 'musculoskeletal/motor/muscular_system',
        background: { color: '#FFFFFF' },
      });

      // Set up event listeners
      humanInstance.on('human.ready', () => {
        console.log('Human model loaded');
        setIsLoading(false);
        setHuman(humanInstance);
        
        // Hide all organs except the muscular system
        humanInstance.send('scene.visibleObjectsOnly', { 
          objects: ['muscular_system'] 
        });
      });

      humanInstance.on('error', (error) => {
        console.error('BioDigital Human error:', error);
        setIsLoading(false);
      });
    }
  };

  // Handle muscle group selection
  const highlightMuscleGroup = (groupName) => {
    if (!human || !muscleGroups[groupName]) return;
    
    setSelectedMuscleGroup(groupName);
    
    // Reset all muscles to normal state
    Object.values(muscleGroups).flat().forEach(muscleId => {
      human.send('scene.node.color', {
        id: muscleId,
        color: { r: 1, g: 0.7, b: 0.7, a: 1 }, // Default muscle color
        glossiness: 5
      });
    });
    
    // Highlight selected muscles
    muscleGroups[groupName].forEach(muscleId => {
      human.send('scene.node.color', {
        id: muscleId,
        color: { r: 1, g: 0, b: 0, a: 1 }, // Bright red for highlight
        glossiness: 10
      });
      
      // Focus camera on the muscle group
      human.send('scene.focus', { 
        objects: muscleGroups[groupName]
      });
    });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Muscle Viewer | Fitness App</title>
        <meta name="description" content="Interactive 3D human muscle viewer" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Interactive Muscle Viewer</h1>
        
        <div className={styles.controls}>
          <button 
            className={`${styles.button} ${selectedMuscleGroup === 'chest' ? styles.active : ''}`}
            onClick={() => highlightMuscleGroup('chest')}
          >
            Chest Muscles
          </button>
          <button 
            className={`${styles.button} ${selectedMuscleGroup === 'bicep' ? styles.active : ''}`}
            onClick={() => highlightMuscleGroup('bicep')}
          >
            Bicep Muscles
          </button>
          <button 
            className={`${styles.button} ${selectedMuscleGroup === 'legs' ? styles.active : ''}`}
            onClick={() => highlightMuscleGroup('legs')}
          >
            Leg Muscles
          </button>
        </div>
        
        <div className={styles.viewerContainer}>
          {isLoading && <div className={styles.loading}>Loading 3D Human Model...</div>}
          <div 
            ref={humanRef} 
            className={styles.humanViewer}
          ></div>
        </div>
        
        {selectedMuscleGroup && (
          <div className={styles.info}>
            <h2>Selected Muscle Group: {selectedMuscleGroup.charAt(0).toUpperCase() + selectedMuscleGroup.slice(1)}</h2>
            <p>
              This view highlights the primary muscles in the {selectedMuscleGroup} region.
              Rotate the model using your mouse to see different angles.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}