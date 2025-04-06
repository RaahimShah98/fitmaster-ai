"use client";

import React, { useEffect, useState } from "react";
import Head from "next/head";
import styles from "../styles/MuscleViewer.module.css";

export default function MuscleViewer() {
  const [human, setHuman] = useState<any>(null);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const muscleGroups: Record<string, string[]> = {
    chest: [
      "pectoralis_major_right",
      "pectoralis_major_left",
      "pectoralis_minor_right",
      "pectoralis_minor_left",
    ],
    bicep: ["biceps_brachii_right", "biceps_brachii_left"],
    legs: [
      "quadriceps_right",
      "quadriceps_left",
      "hamstrings_right",
      "hamstrings_left",
      "gastrocnemius_right",
      "gastrocnemius_left",
    ],
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://developer.biodigital.com/builds/api/2/human-api.min.js";
    script.async = true;
    script.onload = initializeHuman;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializeHuman = () => {
    if (window.HumanAPI) {
      const humanInstance = new window.HumanAPI({
        iframeId: "biodigital-human",
        apikey: process.env.NEXT_PUBLIC_BIODIGITAL_API_KEY,
        model: "musculoskeletal/motor/muscular_system",
        background: { color: "#FFFFFF" },
        ui: false,
      });

      humanInstance.on("human.ready", () => {
        console.log("Human model loaded");
        setIsLoading(false);
        setHuman(humanInstance);

        humanInstance.send("scene.visibleObjectsOnly", {
          objects: ["muscular_system"],
        });
      });

      humanInstance.on("error", (error: any) => {
        console.error("BioDigital Human error:", error);
        setIsLoading(false);
      });
    }
  };

  const highlightMuscleGroup = (groupName: string) => {
    if (!human || !muscleGroups[groupName]) return;

    setSelectedMuscleGroup(groupName);

    Object.values(muscleGroups)
      .flat()
      .forEach((muscleId) => {
        human.send("scene.node.color", {
          id: muscleId,
          color: { r: 1, g: 0.7, b: 0.7, a: 1 },
          glossiness: 5,
        });
      });

    muscleGroups[groupName].forEach((muscleId) => {
      human.send("scene.node.color", {
        id: muscleId,
        color: { r: 1, g: 0, b: 0, a: 1 },
        glossiness: 10,
      });
    });

    human.send("scene.focus", {
      objects: muscleGroups[groupName],
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
          {Object.keys(muscleGroups).map((group) => (
            <button
              key={group}
              className={`${styles.button} ${
                selectedMuscleGroup === group ? styles.active : ""
              }`}
              onClick={() => highlightMuscleGroup(group)}
            >
              {group.charAt(0).toUpperCase() + group.slice(1)} Muscles
            </button>
          ))}
        </div>

        <div className={styles.viewerContainer}>
          {isLoading && (
            <div className={styles.loading}>Loading 3D Human Model...</div>
          )}
          <iframe
            id="biodigital-human"
            title="BioDigital Human"
            className={styles.humanViewer}
          ></iframe>
        </div>

        {selectedMuscleGroup && (
          <div className={styles.info}>
            <h2>
              Selected Muscle Group:{" "}
              {selectedMuscleGroup.charAt(0).toUpperCase() +
                selectedMuscleGroup.slice(1)}
            </h2>
            <p>
              This view highlights the primary muscles in the{" "}
              {selectedMuscleGroup} region. Rotate the model using your mouse to
              see different angles.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
