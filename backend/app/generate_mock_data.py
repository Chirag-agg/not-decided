import json
import csv
import os

def generate():
    """Generate mock data for the knowledge intelligence platform."""
    # Resolve data directory relative to the backend root (parent of app/)
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, "data")

    os.makedirs(os.path.join(data_dir, "manuals"), exist_ok=True)
    os.makedirs(os.path.join(data_dir, "logs"), exist_ok=True)
    os.makedirs(os.path.join(data_dir, "incidents"), exist_ok=True)

    # 1. Mock Maintenance Logs (CSV)
    maintenance_logs = [
        {"work_order_id": "WO-10234", "equipment_id": "PMP-101", "date": "2023-10-15", "type": "Preventative", "description": "Routine lubrication and seal check.", "technician": "John Doe", "status": "Completed"},
        {"work_order_id": "WO-10567", "equipment_id": "PMP-101", "date": "2024-02-20", "type": "Corrective", "description": "Replaced worn impeller after unusual vibration detected.", "technician": "Jane Smith", "status": "Completed"},
        {"work_order_id": "WO-11002", "equipment_id": "PMP-101", "date": "2024-05-10", "type": "Inspection", "description": "High temp on casing. No immediate action taken, added to watch list.", "technician": "Mike Ross", "status": "Completed"},
        {"work_order_id": "WO-11105", "equipment_id": "VLV-205", "date": "2024-06-01", "type": "Preventative", "description": "Actuator calibration.", "technician": "John Doe", "status": "Completed"}
    ]

    with open(os.path.join(data_dir, 'logs', 'maintenance_history.csv'), 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=maintenance_logs[0].keys())
        writer.writeheader()
        writer.writerows(maintenance_logs)

    # 2. Mock Incident Reports (JSON)
    incidents = [
        {
            "incident_id": "INC-2023-089",
            "date": "2023-11-05",
            "equipment_id": "PMP-101",
            "severity": "High",
            "description": "Unplanned shutdown due to bearing failure on cooling pump PMP-101. Root cause traced to lack of lubrication on drive side.",
            "action_taken": "Replaced bearings, updated PM schedule to lubricate every 3 months instead of 6.",
            "related_documents": ["OEM-PMP-101-Manual"]
        }
    ]

    with open(os.path.join(data_dir, 'incidents', 'incidents.json'), 'w') as f:
        json.dump(incidents, f, indent=4)

    # 3. Mock OEM Manual Text
    manual_text = """
OEM Manual: Centrifugal Pump Model X-100 (Equipment ID: PMP-101)

1. General Overview
The X-100 centrifugal pump is designed for high-volume cooling water circulation. 

2. Operating Parameters
- Max Temperature: 85°C
- Nominal Vibration: < 2.5 mm/s RMS
- Warning Vibration: > 4.5 mm/s RMS
- Critical Vibration: > 7.1 mm/s RMS (Immediate shutdown required)

3. Troubleshooting
Symptom: High Vibration
Potential Causes:
- Cavitation (check inlet pressure)
- Bearing wear (check lubrication, replace if worn)
- Misalignment (check shaft alignment)

4. Maintenance Schedule
- Monthly: Visual inspection for leaks.
- Quarterly: Lubricate bearings (Lithium-based grease, 15g per bearing).
- Annually: Check impeller clearance and seal integrity.
"""

    with open(os.path.join(data_dir, 'manuals', 'PMP-101_OEM_Manual.txt'), 'w') as f:
        f.write(manual_text)

    print("Mock data generated successfully in data/ directory.")


if __name__ == "__main__":
    generate()
