from datetime import datetime, timedelta

def get_node(graph_data, node_id):
    return next((n for n in graph_data.get("nodes", []) if n["id"] == node_id), None)

def get_neighbors(graph_data, node_id):
    neighbors = []
    for link in graph_data.get("links", []):
        if link["source"] == node_id:
            neighbors.append(get_node(graph_data, link["target"]))
        elif link["target"] == node_id:
            neighbors.append(get_node(graph_data, link["source"]))
    return [n for n in neighbors if n is not None]

def evaluate_compliance(graph_data):
    """
    Evaluates all equipment in the graph against defined compliance rules.
    Returns a list of compliance objects (one per rule).
    """
    
    rules = [
        {
            "id": "OISD-116",
            "desc": "Asset Health & Integrity Standard",
            "owner": "Safety Team"
        },
        {
            "id": "OISD-142",
            "desc": "Inspection Cadence",
            "owner": "Maintenance"
        },
        {
            "id": "FACT-87",
            "desc": "Unresolved Incident Escalation",
            "owner": "Operations"
        }
    ]
    
    results = []
    
    equipment_nodes = [n for n in graph_data.get("nodes", []) if n.get("group") == "Equipment"]
    
    today = datetime.now()
    
    for rule in rules:
        status = "PASS"
        reasons = []
        related_entities = set()
        
        for eq in equipment_nodes:
            eq_id = eq["id"]
            
            if rule["id"] == "OISD-116":
                health = eq.get("health_score")
                if health is not None:
                    if health < 70:
                        status = "FAIL"
                        reasons.append(f"{eq_id} health critical ({health}%)")
                        related_entities.add(eq_id)
                    elif health < 85 and status != "FAIL":
                        status = "WARNING"
                        reasons.append(f"{eq_id} health degraded ({health}%)")
                        related_entities.add(eq_id)
                        
            elif rule["id"] == "OISD-142":
                last_maint = eq.get("last_inspection_date")
                if last_maint:
                    maint_date = datetime.strptime(last_maint, "%Y-%m-%d")
                    days_ago = (today - maint_date).days
                    if days_ago > 90:
                        if status != "FAIL": status = "WARNING"
                        reasons.append(f"{eq_id} inspection overdue ({days_ago} days)")
                        related_entities.add(eq_id)
                        
            elif rule["id"] == "FACT-87":
                neighbors = get_neighbors(graph_data, eq_id)
                incidents = [n for n in neighbors if n["group"] == "Incident"]
                for inc in incidents:
                    inc_neighbors = get_neighbors(graph_data, inc["id"])
                    has_wo = any(n["group"] == "WorkOrder" for n in inc_neighbors)
                    if not has_wo:
                        status = "FAIL"
                        reasons.append(f"{eq_id} has unresolved incident {inc['id']}")
                        related_entities.add(eq_id)
                        related_entities.add(inc["id"])

        if status == "PASS":
            reasons.append("All assets compliant.")

        results.append({
            "id": rule["id"],
            "desc": rule["desc"],
            "status": status,
            "date": today.strftime("%Y-%m-%d"),
            "owner": rule["owner"],
            "reasons": reasons[:3] + (["..."] if len(reasons) > 3 else []), # Truncate long lists for UI
            "entities": list(related_entities)
        })
        
    return results

def get_asset_health(graph_data):
    """
    Returns asset list derived directly from graph nodes.
    """
    equipment_nodes = [n for n in graph_data.get("nodes", []) if n.get("group") == "Equipment"]
    assets = []
    
    for eq in equipment_nodes:
        health = eq.get("health_score", 100)
        
        status = "HEALTHY"
        if health < 70:
            status = "CRITICAL"
        elif health < 85:
            status = "WARNING"
            
        assets.append({
            "id": eq["id"],
            "type": eq.get("equipment_type", "Unknown"),
            "health": health,
            "risk": 100 - health,
            "lastMaint": eq.get("last_inspection_date", "Unknown"),
            "status": status
        })
        
    return assets
