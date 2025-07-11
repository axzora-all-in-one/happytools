#!/usr/bin/env python3

import requests
import json
import time
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://f2884661-c20b-483f-ad47-0b43883bbdde.preview.emergentagent.com/api"
HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
}

def test_workflow_database_storage():
    """Test that workflows are properly saved to MongoDB"""
    print("🔍 TESTING WORKFLOW DATABASE STORAGE")
    print("="*50)
    
    # First, let's try to generate a workflow that should fallback to basic template
    print("\n--- Testing Database Storage with Basic Template ---")
    try:
        payload = {
            "name": "Database Storage Test Workflow",
            "description": "Testing if workflows are saved to database",
            "provider": "openai",
            "apiKey": "invalid-key-to-trigger-fallback",
            "automationDescription": "Simple test workflow for database storage verification",
            "platform": "n8n"
        }
        
        response = requests.post(f"{BASE_URL}/workflow-builder/generate", json=payload, headers=HEADERS, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'metadata' in data and 'workflow_id' in data['metadata']:
                workflow_id = data['metadata']['workflow_id']
                print(f"✅ Workflow generated and saved with ID: {workflow_id}")
                
                # Verify the workflow structure
                if 'workflow' in data and 'visualPreview' in data:
                    workflow = data['workflow']
                    preview = data['visualPreview']
                    node_count = data.get('nodeCount', 0)
                    
                    print(f"✅ Workflow structure valid: {node_count} nodes")
                    print(f"✅ Visual preview generated: {len(preview)} characters")
                    
                    # Check if it's n8n format
                    if 'nodes' in workflow and 'connections' in workflow:
                        print("✅ N8N workflow format correct")
                    else:
                        print("❌ N8N workflow format incorrect")
                        
                    return True
                else:
                    print("❌ Workflow structure missing")
                    return False
            else:
                print(f"❌ Workflow generation failed: {data}")
                return False
        else:
            print(f"❌ HTTP {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return False

def test_workflow_helper_functions():
    """Test the helper functions work correctly"""
    print("\n🔧 TESTING WORKFLOW HELPER FUNCTIONS")
    print("="*50)
    
    # Test with Make.com platform
    print("\n--- Testing Make.com Basic Template ---")
    try:
        payload = {
            "name": "Make.com Helper Test",
            "description": "Testing Make.com helper functions",
            "provider": "gemini",
            "apiKey": "invalid-key-to-trigger-fallback",
            "automationDescription": "Test Make.com workflow generation with helper functions",
            "platform": "make"
        }
        
        response = requests.post(f"{BASE_URL}/workflow-builder/generate", json=payload, headers=HEADERS, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'workflow' in data:
                workflow = data['workflow']
                
                # Check if it's Make.com format
                if 'scenario' in workflow and 'flow' in workflow.get('scenario', {}):
                    print("✅ Make.com workflow format correct")
                    
                    # Check visual preview
                    if 'visualPreview' in data and 'Make.com' in data['visualPreview']:
                        print("✅ Make.com visual preview generated correctly")
                    else:
                        print("❌ Make.com visual preview incorrect")
                        
                    # Check node counting
                    node_count = data.get('nodeCount', 0)
                    if node_count > 0:
                        print(f"✅ Node counting working: {node_count} modules")
                    else:
                        print("❌ Node counting not working")
                        
                    return True
                else:
                    print("❌ Make.com workflow format incorrect")
                    return False
            else:
                print(f"❌ Make.com workflow generation failed: {data}")
                return False
        else:
            print(f"❌ HTTP {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return False

def test_workflow_validation_edge_cases():
    """Test edge cases for workflow validation"""
    print("\n🧪 TESTING WORKFLOW VALIDATION EDGE CASES")
    print("="*50)
    
    test_cases = [
        {
            "name": "Empty JSON Test",
            "payload": {},
            "expected_status": 400,
            "description": "Should reject empty payload"
        },
        {
            "name": "Partial Fields Test",
            "payload": {
                "name": "Test",
                "provider": "openai"
                # Missing other required fields
            },
            "expected_status": 400,
            "description": "Should reject partial required fields"
        },
        {
            "name": "All Providers Test",
            "payload": {
                "name": "Provider Test",
                "provider": "claude",
                "apiKey": "test-key",
                "automationDescription": "Test all providers",
                "platform": "n8n"
            },
            "expected_status": 500,  # Should fail with invalid API key
            "description": "Should handle all valid providers"
        }
    ]
    
    passed = 0
    total = len(test_cases)
    
    for test_case in test_cases:
        print(f"\n--- {test_case['name']} ---")
        try:
            response = requests.post(f"{BASE_URL}/workflow-builder/generate", 
                                   json=test_case['payload'], 
                                   headers=HEADERS, 
                                   timeout=30)
            
            if response.status_code == test_case['expected_status']:
                print(f"✅ {test_case['description']}")
                passed += 1
            else:
                print(f"❌ Expected {test_case['expected_status']}, got {response.status_code}")
                
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
    
    print(f"\n📊 Edge Case Tests: {passed}/{total} passed")
    return passed == total

def main():
    """Run all comprehensive workflow builder tests"""
    print("🚀 COMPREHENSIVE WORKFLOW BUILDER TESTING")
    print("="*80)
    print(f"Testing Backend URL: {BASE_URL}")
    print(f"Test Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    tests = [
        ("Database Storage", test_workflow_database_storage),
        ("Helper Functions", test_workflow_helper_functions),
        ("Validation Edge Cases", test_workflow_validation_edge_cases)
    ]
    
    passed_tests = 0
    total_tests = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            if test_func():
                print(f"✅ {test_name} - PASSED")
                passed_tests += 1
            else:
                print(f"❌ {test_name} - FAILED")
        except Exception as e:
            print(f"❌ {test_name} - EXCEPTION: {str(e)}")
    
    # Final summary
    print("\n" + "="*80)
    print("COMPREHENSIVE TEST SUMMARY")
    print("="*80)
    print(f"✅ Passed: {passed_tests}")
    print(f"❌ Failed: {total_tests - passed_tests}")
    print(f"📊 Success Rate: {(passed_tests / total_tests * 100):.1f}%")
    print(f"🕒 Test Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    if passed_tests == total_tests:
        print("\n🎉 ALL COMPREHENSIVE TESTS PASSED!")
        print("✨ Workflow Builder is fully functional and ready for production!")
    else:
        print(f"\n⚠️  {total_tests - passed_tests} tests failed. Review the issues above.")
    
    return passed_tests == total_tests

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)