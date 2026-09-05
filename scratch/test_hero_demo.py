import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1/hero-demo"

def req(url, method="GET", data=None):
    request = urllib.request.Request(url, method=method)
    request.add_header('Content-Type', 'application/json')
    body = json.dumps(data).encode('utf-8') if data else None
    with urllib.request.urlopen(request, data=body, timeout=10) as response:
        return json.loads(response.read().decode('utf-8'))

def test_hero_demo():
    print("=== Testing Hero Demo Endpoints ===")
    
    # 1. Scenarios
    scenarios = req(f"{BASE_URL}/scenarios")
    print(f"Scenarios found: {len(scenarios)}")
    assert len(scenarios) >= 4, "Expected at least 4 scenarios"
    for s in scenarios:
        print(f" - [{s['id']}] {s['title']} ({s['business_type']}) - Category: {s['target_category']}")
        
    # 2. Get Initial State
    state = req(f"{BASE_URL}/state?scenario_id=mumbai_retail_expansion")
    print(f"Initial State Current Step: {state['current_step']}, Steps count: {len(state['steps'])}")
    assert state['current_step'] == 1
    assert len(state['steps']) >= 1
    
    # 3. Step Through 1 to 10
    for step in range(2, 11):
        step_res = req(f"{BASE_URL}/step", method="POST", data={"scenario_id": "mumbai_retail_expansion", "step_number": step})
        print(f"Executed Step {step}/10: {step_res['scenario']['title']} -> Step Current: {step_res['current_step']}")
        assert step_res['current_step'] == step
        assert len(step_res['steps']) == step
        # Verify that current step has reasoning, audit_log, and risk_check
        current_step_obj = step_res['steps'][-1]
        assert current_step_obj['reasoning'] is not None
        assert current_step_obj['audit_log'] is not None
        assert current_step_obj['risk_check'] is not None
        if step >= 7:
            assert len(step_res['transactions']) >= 1
            
    print("All 10 steps executed successfully with audit logs, reasoning traces, risk checks, and transactions!")
    
    # 4. Run All on FinOps Scenario
    finops_res = req(f"{BASE_URL}/run-all", method="POST", data={"scenario_id": "cloud_finops_suite"})
    print(f"Run-All FinOps Step: {finops_res['current_step']}, Completed: {finops_res['is_completed']}")
    assert finops_res['current_step'] == 10
    assert finops_res['is_completed'] is True
    assert len(finops_res['steps']) == 10
    assert len(finops_res['transactions']) >= 1
    
    # 5. Reset
    reset_res = req(f"{BASE_URL}/reset", method="POST", data={"scenario_id": "mumbai_retail_expansion"})
    print(f"Reset retail state: Current Step = {reset_res['current_step']}")
    assert reset_res['current_step'] == 1
    assert len(reset_res['steps']) == 1
    
    print("\n>>> ALL HERO DEMO BACKEND TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    try:
        test_hero_demo()
    except Exception as e:
        import traceback
        traceback.print_exc()
        sys.exit(1)
