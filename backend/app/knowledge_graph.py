import networkx as nx

def build_knowledge_graph():
    """
    Builds a large, dense in-memory knowledge graph simulating an entire cooling subsystem.
    """
    G = nx.Graph()
    
    # 1. EQUIPMENT NODES (Blue)
    equipment = [
        {"id": "PMP-101", "label": "Main Cooling Pump A", "type": "Centrifugal Pump", "health": 68, "lastMaint": "2026-06-12", "desc": "Primary centrifugal pump responsible for circulating coolant through the main heat exchanger loop.", "metrics": {"Vibration (mm/s)": 4.2, "Flow Rate (GPM)": 450, "RPM": 1780}},
        {"id": "PMP-102", "label": "Aux Cooling Pump B", "type": "Centrifugal Pump", "health": 95, "lastMaint": "2026-07-15", "desc": "Auxiliary backup pump for the main cooling loop, automatically engages on primary failure.", "metrics": {"Vibration (mm/s)": 2.1, "Flow Rate (GPM)": 0, "RPM": 0}},
        {"id": "MTR-501", "label": "Pump Motor A", "type": "Induction Motor", "health": 92, "lastMaint": "2026-07-01", "desc": "3-phase AC induction motor driving Main Cooling Pump A.", "metrics": {"Temp (°C)": 85.4, "Current (A)": 142.1, "Voltage (V)": 480}},
        {"id": "MTR-502", "label": "Pump Motor B", "type": "Induction Motor", "health": 88, "lastMaint": "2026-06-20", "desc": "3-phase AC induction motor driving Aux Cooling Pump B.", "metrics": {"Temp (°C)": 42.1, "Current (A)": 0, "Voltage (V)": 480}},
        {"id": "VLV-201", "label": "Inlet Valve A", "type": "Control Valve", "health": 85, "lastMaint": "2026-06-28", "desc": "Pneumatic control valve regulating coolant flow into PMP-101.", "metrics": {"Position (%)": 100, "Pressure Drop (PSI)": 2.1}},
        {"id": "VLV-202", "label": "Outlet Valve A", "type": "Control Valve", "health": 80, "lastMaint": "2026-06-10", "desc": "Pneumatic control valve regulating coolant flow out of PMP-101.", "metrics": {"Position (%)": 100, "Pressure Drop (PSI)": 1.8}},
        {"id": "VLV-203", "label": "Bypass Valve", "type": "Control Valve", "health": 99, "lastMaint": "2026-07-18", "desc": "Emergency bypass valve to divert flow around the primary heat exchanger.", "metrics": {"Position (%)": 0, "Pressure Drop (PSI)": 0}},
        {"id": "HX-301", "label": "Primary Heat Exchanger", "type": "Heat Exchanger", "health": 74, "lastMaint": "2026-05-15", "desc": "Shell and tube heat exchanger for rejecting heat from the primary cooling loop.", "metrics": {"Inlet Temp (°C)": 95, "Outlet Temp (°C)": 45, "Fouling Factor": 0.002}},
        {"id": "SEN-T1", "label": "Temp Sensor Inlet", "type": "Sensor", "health": 98, "lastMaint": "2026-07-19", "desc": "RTD temperature sensor monitoring coolant temperature at the heat exchanger inlet.", "metrics": {"Reading (°C)": 95.2}},
        {"id": "SEN-T2", "label": "Temp Sensor Outlet", "type": "Sensor", "health": 97, "lastMaint": "2026-07-19", "desc": "RTD temperature sensor monitoring coolant temperature at the heat exchanger outlet.", "metrics": {"Reading (°C)": 44.8}},
        {"id": "SEN-V1", "label": "Vibration Sensor Motor A", "type": "Sensor", "health": 99, "lastMaint": "2026-07-19", "desc": "Piezoelectric accelerometer mounted on the drive-end bearing of MTR-501.", "metrics": {"Overall Vib (mm/s)": 3.8, "High Freq Peak (g)": 0.4}},
        {"id": "SEN-V2", "label": "Vibration Sensor Pump A", "type": "Sensor", "health": 99, "lastMaint": "2026-07-19", "desc": "Piezoelectric accelerometer mounted on the pump casing of PMP-101.", "metrics": {"Overall Vib (mm/s)": 4.2, "High Freq Peak (g)": 1.1}},
    ]
    for eq in equipment:
        G.add_node(
            eq["id"], 
            label=f"Eq: {eq['label']}", 
            group="Equipment", 
            description=eq["desc"],
            metrics=eq["metrics"],
            equipment_type=eq["type"],
            health_score=eq["health"],
            last_inspection_date=eq["lastMaint"]
        )

    # Equipment physical relationships
    physical_links = [
        ("PMP-101", "MTR-501"), ("PMP-102", "MTR-502"),
        ("VLV-201", "PMP-101"), ("PMP-101", "VLV-202"),
        ("VLV-202", "HX-301"), ("PMP-102", "HX-301"),
        ("HX-301", "VLV-203"),
        ("SEN-T1", "HX-301"), ("SEN-T2", "HX-301"),
        ("SEN-V1", "MTR-501"), ("SEN-V2", "PMP-101")
    ]
    for s, t in physical_links:
        G.add_edge(s, t, relationship="connected_to")

    # 2. DOCUMENT NODES (Green)
    docs = [
        ("OEM-PMP-X", "Pump Series Manual", "Original Equipment Manufacturer (OEM) installation, operation, and maintenance manual for the X-Series centrifugal pumps."),
        ("OEM-MTR-Y", "Motor Service Guide", "Maintenance guidelines and specifications for Y-Series induction motors, including bearing replacement procedures."),
        ("OEM-HX-Z", "Exchanger Specs", "Design specifications, materials, and thermal performance curves for the Z-Series shell and tube heat exchanger."),
        ("SOP-042", "Cooling System Startup SOP", "Standard Operating Procedure detailing the step-by-step process for safely starting the main cooling loop."),
        ("SOP-043", "Emergency Shutdown SOP", "Standard Operating Procedure for emergency isolation and shutdown of the cooling system during critical failures."),
        ("ISO-9001-A", "Quality Policy: Cooling", "Regulatory compliance document outlining the quality management requirements for cooling system maintenance."),
    ]
    for doc_id, label, desc in docs:
        G.add_node(doc_id, label=f"Doc: {label}", group="Document", description=desc)

    # Document relationships
    doc_links = [
        ("PMP-101", "OEM-PMP-X"), ("PMP-102", "OEM-PMP-X"),
        ("MTR-501", "OEM-MTR-Y"), ("MTR-502", "OEM-MTR-Y"),
        ("HX-301", "OEM-HX-Z"),
        ("PMP-101", "SOP-042"), ("PMP-101", "SOP-043"),
        ("HX-301", "ISO-9001-A")
    ]
    for s, t in doc_links:
        G.add_edge(s, t, relationship="referenced_by")

    # 3. INCIDENT NODES (Red)
    incidents = [
        ("INC-23-089", "Bearing Failure (PMP-101)", "Catastrophic failure of the drive-end bearing on PMP-101 due to inadequate lubrication, resulting in 14 hours of unplanned downtime."),
        ("INC-23-102", "Overheating (MTR-501)", "Stator winding temperature exceeded 135°C on MTR-501. Traced to a blocked cooling fan intake."),
        ("INC-24-005", "Seal Leak (VLV-202)", "Minor coolant leak detected at the stem packing of VLV-202 during routine inspection."),
        ("INC-24-012", "Sensor Drift (SEN-T1)", "Inlet temperature sensor SEN-T1 drifted out of calibration by +4°C, causing incorrect thermal efficiency calculations."),
    ]
    for inc_id, label, desc in incidents:
        G.add_node(inc_id, label=f"Inc: {label}", group="Incident", description=desc)

    # Incident relationships
    inc_links = [
        ("INC-23-089", "PMP-101"), ("INC-23-089", "OEM-PMP-X"),
        ("INC-23-102", "MTR-501"), ("INC-23-102", "SEN-V1"),
        ("INC-24-005", "VLV-202"),
        ("INC-24-012", "SEN-T1"), ("INC-24-012", "HX-301")
    ]
    for s, t in inc_links:
        G.add_edge(s, t, relationship="involved_in")

    # 4. WORK ORDER NODES (Yellow)
    wos = [
        ("WO-102", "PM: Lube PMP-101", "Preventive Maintenance: Replenish grease in PMP-101 bearings according to OEM specifications."),
        ("WO-103", "PM: Lube PMP-102", "Preventive Maintenance: Replenish grease in PMP-102 bearings according to OEM specifications."),
        ("WO-104", "Insp: Motor A Winding", "Condition-Based Maintenance: Perform megger test on MTR-501 stator windings following recent overheating incident."),
        ("WO-105", "Replace Impeller A", "Corrective Maintenance: Replace worn impeller on PMP-101. Required due to cavitation damage."),
        ("WO-106", "Calibrate SEN-T1", "Corrective Maintenance: Recalibrate SEN-T1 against a certified reference block to correct +4°C drift."),
        ("WO-107", "Tighten VLV-201 Packing", "Corrective Maintenance: Tighten packing nut on VLV-201 to eliminate weeping leak."),
        ("WO-108", "Flush HX-301", "Preventive Maintenance: Perform chemical flush of HX-301 to remove scaling and restore thermal efficiency."),
    ]
    for wo_id, label, desc in wos:
        G.add_node(wo_id, label=f"WO: {label}", group="WorkOrder", description=desc)

    # Work Order relationships
    wo_links = [
        ("WO-102", "PMP-101"), ("WO-103", "PMP-102"),
        ("WO-104", "MTR-501"), ("WO-105", "PMP-101"),
        ("WO-105", "INC-23-089"), # Work order created because of incident
        ("WO-106", "SEN-T1"), ("WO-106", "INC-24-012"),
        ("WO-107", "VLV-201"),
        ("WO-108", "HX-301"), ("WO-108", "SOP-043")
    ]
    for s, t in wo_links:
        G.add_edge(s, t, relationship="maintained_by")
        
    return nx.node_link_data(G)
