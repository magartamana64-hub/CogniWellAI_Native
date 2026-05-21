import numpy as np

def analyze_user_data(data):
    usage_logs = data.get("usage_logs", [])
    mood = data.get("mood", {})

    total_screen_time = sum(
        item.get("duration_minutes", 0)
        for item in usage_logs
    )

    social_media_time = sum(
        item.get("duration_minutes", 0)
        for item in usage_logs
        if "social" in item.get("category", "").lower()
    )

    stress = mood.get("stress_level", 3)
    focus = mood.get("focus_level", 3)
    energy = mood.get("energy_level", 3)

    focus_score = max(
        0,
        100
        - (stress * 12)
        - (social_media_time / 8)
        + (focus * 8)
        + (energy * 5)
    )

    focus_score = round(focus_score)

    risk_level = "Low"

    if total_screen_time > 480:
        risk_level = "Moderate"

    if social_media_time > 240 and stress >= 4:
        risk_level = "High"

    recommendations = []

    if social_media_time > 180:
        recommendations.append(
            "Reduce social media usage and schedule digital detox periods."
        )

    if stress >= 4:
        recommendations.append(
            "High stress detected. Consider breathing exercises and shorter work sessions."
        )

    if focus <= 2:
        recommendations.append(
            "Low focus levels detected. Enable focus mode during study or work."
        )

    if energy <= 2:
        recommendations.append(
            "Your energy level appears low. Improve sleep consistency and hydration."
        )

    if total_screen_time > 600:
        recommendations.append(
            "Excessive screen time detected. Take offline breaks every 30-45 minutes."
        )

    if len(recommendations) == 0:
        recommendations.append(
            "Your digital wellbeing patterns appear healthy today."
        )

    return {
        "focus_score": focus_score,
        "risk_level": risk_level,
        "total_screen_time": total_screen_time,
        "social_media_time": social_media_time,
        "recommendations": recommendations
    }