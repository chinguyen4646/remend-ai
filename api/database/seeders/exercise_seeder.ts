import { BaseSeeder } from "@adonisjs/lucid/seeders";
import db from "@adonisjs/lucid/services/db";

export default class extends BaseSeeder {
  async run() {
    // Clear existing data (for development)
    await db.from("exercises").delete();
    await db.from("exercise_buckets").delete();

    // Insert exercise buckets for knee rehab
    const buckets = await db
      .table("exercise_buckets")
      .insert([
        {
          area: "knee",
          slug: "mobility_knee",
          label: "Knee Mobility",
          is_active: true,
          sort_order: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          area: "knee",
          slug: "isometric_knee",
          label: "Isometric Knee Strengthening",
          is_active: true,
          sort_order: 2,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          area: "knee",
          slug: "activation_quads",
          label: "Quadriceps Activation",
          is_active: true,
          sort_order: 3,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          area: "knee",
          slug: "light_strength_knee",
          label: "Light Knee Strengthening",
          is_active: true,
          sort_order: 4,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          area: "knee",
          slug: "stability_lower",
          label: "Lower Body Stability",
          is_active: true,
          sort_order: 5,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ])
      .returning("*");

    // Helper to find bucket by slug
    const getBucketId = (slug: string) => {
      const bucket = buckets.find((b: any) => b.slug === slug);
      return bucket?.id;
    };

    // Insert exercises
    await db.table("exercises").insert([
      // Mobility Exercises (2 exercises)
      {
        bucket_id: getBucketId("mobility_knee"),
        name: "Supine Knee Flexion",
        description: "Lying on your back, gently bend and straighten your knee",
        dosage_low_json: JSON.stringify({
          sets: 2,
          reps: 10,
          rest_seconds: 30,
          notes: "Move slowly through available range",
        }),
        dosage_mod_json: JSON.stringify({
          sets: 3,
          reps: 15,
          rest_seconds: 30,
          notes: "Aim for smooth, controlled movement",
        }),
        safety_notes: "Stop if sharp pain occurs",
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        bucket_id: getBucketId("mobility_knee"),
        name: "Heel Slides",
        description: "Slide your heel toward your buttock while lying down",
        dosage_low_json: JSON.stringify({
          sets: 2,
          reps: 8,
          rest_seconds: 30,
          notes: "Use a towel under heel if helpful",
        }),
        dosage_mod_json: JSON.stringify({
          sets: 3,
          reps: 12,
          rest_seconds: 30,
          notes: "Progress range as tolerated",
        }),
        safety_notes: "Stay within comfortable range",
        is_active: true,
        sort_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Isometric Exercises (2 exercises)
      {
        bucket_id: getBucketId("isometric_knee"),
        name: "Quad Sets",
        description: "Tighten your thigh muscle while keeping leg straight",
        dosage_low_json: JSON.stringify({
          sets: 3,
          hold_seconds: 5,
          rest_seconds: 30,
          notes: "Focus on muscle contraction",
        }),
        dosage_mod_json: JSON.stringify({
          sets: 4,
          hold_seconds: 8,
          rest_seconds: 30,
          notes: "Maintain steady contraction",
        }),
        safety_notes: "No pain should occur during hold",
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        bucket_id: getBucketId("isometric_knee"),
        name: "Straight Leg Raise Hold",
        description: "Lift straight leg and hold just off the ground",
        dosage_low_json: JSON.stringify({
          sets: 2,
          hold_seconds: 5,
          rest_seconds: 45,
          notes: "Keep knee locked straight",
        }),
        dosage_mod_json: JSON.stringify({
          sets: 3,
          hold_seconds: 8,
          rest_seconds: 45,
          notes: "Increase hold time gradually",
        }),
        safety_notes: "Stop if back arches or pain increases",
        is_active: true,
        sort_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Quad Activation Exercises (2 exercises)
      {
        bucket_id: getBucketId("activation_quads"),
        name: "Seated Knee Extension",
        description: "Sit in chair and straighten knee against gravity",
        dosage_low_json: JSON.stringify({
          sets: 2,
          reps: 10,
          rest_seconds: 45,
          notes: "Control the lowering phase",
        }),
        dosage_mod_json: JSON.stringify({
          sets: 3,
          reps: 12,
          rest_seconds: 45,
          notes: "Pause at top of movement",
        }),
        safety_notes: "Avoid locking knee forcefully",
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        bucket_id: getBucketId("activation_quads"),
        name: "Terminal Knee Extension",
        description: "Standing, straighten knee fully against resistance band",
        dosage_low_json: JSON.stringify({
          sets: 2,
          reps: 12,
          rest_seconds: 30,
          notes: "Light resistance to start",
        }),
        dosage_mod_json: JSON.stringify({
          sets: 3,
          reps: 15,
          rest_seconds: 30,
          notes: "Increase band resistance as able",
        }),
        safety_notes: "Keep movement controlled",
        is_active: true,
        sort_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Light Strength Exercises (2 exercises)
      {
        bucket_id: getBucketId("light_strength_knee"),
        name: "Mini Squats",
        description: "Shallow squats to 30-45 degrees knee bend",
        dosage_low_json: JSON.stringify({
          sets: 2,
          reps: 8,
          rest_seconds: 60,
          notes: "Use chair for support if needed",
        }),
        dosage_mod_json: JSON.stringify({
          sets: 3,
          reps: 12,
          rest_seconds: 60,
          notes: "Progress depth gradually",
        }),
        safety_notes: "Stop before pain increases",
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        bucket_id: getBucketId("light_strength_knee"),
        name: "Step-Ups",
        description: "Step up onto low platform (4-6 inches)",
        dosage_low_json: JSON.stringify({
          sets: 2,
          reps: 8,
          rest_seconds: 60,
          notes: "Use railing for balance",
        }),
        dosage_mod_json: JSON.stringify({
          sets: 3,
          reps: 10,
          rest_seconds: 60,
          notes: "Control descent carefully",
        }),
        safety_notes: "Ensure stable surface",
        is_active: true,
        sort_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Stability Exercises (2 exercises)
      {
        bucket_id: getBucketId("stability_lower"),
        name: "Single Leg Balance",
        description: "Stand on one leg maintaining balance",
        dosage_low_json: JSON.stringify({
          sets: 2,
          hold_seconds: 10,
          rest_seconds: 30,
          notes: "Use wall for light touch support",
        }),
        dosage_mod_json: JSON.stringify({
          sets: 3,
          hold_seconds: 20,
          rest_seconds: 30,
          notes: "Progress to no support",
        }),
        safety_notes: "Practice near wall or stable surface",
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        bucket_id: getBucketId("stability_lower"),
        name: "Tandem Stance",
        description: "Stand with one foot directly in front of the other",
        dosage_low_json: JSON.stringify({
          sets: 2,
          hold_seconds: 15,
          rest_seconds: 30,
          notes: "Focus on steady balance",
        }),
        dosage_mod_json: JSON.stringify({
          sets: 3,
          hold_seconds: 30,
          rest_seconds: 30,
          notes: "Close eyes for added challenge",
        }),
        safety_notes: "Have support nearby",
        is_active: true,
        sort_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    console.log("✅ Seeded 5 exercise buckets and 10 knee exercises");
  }
}
