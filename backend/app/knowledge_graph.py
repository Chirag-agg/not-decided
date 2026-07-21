import networkx as nx

def build_knowledge_graph():
    """
    Builds a large, dense in-memory knowledge graph simulating an entire cooling subsystem.
    """
    G = nx.Graph()
    
    # 1. EQUIPMENT NODES (Blue)
    equipment = [
        {"id": "PMP-101", "label": "Main Cooling Pump A", "type": "Centrifugal Pump", "health": 68, "lastMaint": "2026-06-12"},
        {"id": "PMP-102", "label": "Aux Cooling Pump B", "type": "Centrifugal Pump", "health": 95, "lastMaint": "2026-07-15"},
        {"id": "MTR-501", "label": "Pump Motor A", "type": "Induction Motor", "health": 92, "lastMaint": "2026-07-01"},
        {"id": "MTR-502", "label": "Pump Motor B", "type": "Induction Motor", "health": 88, "lastMaint": "2026-06-20"},
        {"id": "VLV-201", "label": "Inlet Valve A", "type": "Control Valve", "health": 85, "lastMaint": "2026-06-28"},
        {"id": "VLV-202", "label": "Outlet Valve A", "type": "Control Valve", "health": 80, "lastMaint": "2026-06-10"},
        {"id": "VLV-203", "label": "Bypass Valve", "type": "Control Valve", "health": 99, "lastMaint": "2026-07-18"},
        {"id": "HX-301", "label": "Primary Heat Exchanger", "type": "Heat Exchanger", "health": 74, "lastMaint": "2026-05-15"},
        {"id": "SEN-T1", "label": "Temp Sensor Inlet", "type": "Sensor", "health": 98, "lastMaint": "2026-07-19"},
        {"id": "SEN-T2", "label": "Temp Sensor Outlet", "type": "Sensor", "health": 97, "lastMaint": "2026-07-19"},
        {"id": "SEN-V1", "label": "Vibration Sensor Motor A", "type": "Sensor", "health": 99, "lastMaint": "2026-07-19"},
        {"id": "SEN-V2", "label": "Vibration Sensor Pump A", "type": "Sensor", "health": 99, "lastMaint": "2026-07-19"},
    ]
    for eq in equipment:
        G.add_node(
            eq["id"], 
            label=f"Eq: {eq['label']}", 
            group="Equipment", 
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
        ("OEM-PMP-X", "Pump Series Manual"),
        ("OEM-MTR-Y", "Motor Service Guide"),
        ("OEM-HX-Z", "Exchanger Specs"),
        ("SOP-042", "Cooling System Startup SOP"),
        ("SOP-043", "Emergency Shutdown SOP"),
        ("ISO-9001-A", "Quality Policy: Cooling"),
    ]
    for doc_id, label in docs:
        G.add_node(doc_id, label=f"Doc: {label}", group="Document")

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
        ("INC-23-089", "Bearing Failure (PMP-101)"),
        ("INC-23-102", "Overheating (MTR-501)"),
        ("INC-24-005", "Seal Leak (VLV-202)"),
        ("INC-24-012", "Sensor Drift (SEN-T1)"),
    ]
    for inc_id, label in incidents:
        G.add_node(inc_id, label=f"Inc: {label}", group="Incident")

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
        ("WO-102", "PM: Lube PMP-101"),
        ("WO-103", "PM: Lube PMP-102"),
        ("WO-104", "Insp: Motor A Winding"),
        ("WO-105", "Replace Impeller A"),
        ("WO-106", "Calibrate SEN-T1"),
        ("WO-107", "Tighten VLV-201 Packing"),
        ("WO-108", "Flush HX-301"),
    ]
    for wo_id, label in wos:
        G.add_node(wo_id, label=f"WO: {label}", group="WorkOrder")

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
