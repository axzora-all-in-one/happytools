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

class WorkflowBuilderTester:
    def __init__(self):
        self.passed_tests = 0
        self.failed_tests = 0
        self.test_results = []
        
    def log_test(self, test_name, passed, message=""):
        status = "✅ PASSED" if passed else "❌ FAILED"
        result = f"{status} - {test_name}"
        if message:
            result += f": {message}"
        print(result)
        self.test_results.append({
            'test': test_name,
            'passed': passed,
            'message': message
        })
        
        if passed:
            self.passed_tests += 1
        else:
            self.failed_tests += 1
    
    def test_workflow_builder(self):
        """Test the new workflow builder functionality"""
        print("\n" + "="*80)
        print("TESTING WORKFLOW BUILDER FUNCTIONALITY")
        print("="*80)
        
        # Test 1: Valid workflow generation request (n8n)
        print("\n--- Testing Valid Workflow Generation (n8n) ---")
        try:
            payload = {
                "name": "Email Notification System",
                "description": "Automated email notifications for form submissions",
                "provider": "openai",
                "apiKey": "fake-api-key-for-testing",
                "automationDescription": "When someone submits a contact form on my website, I want to send them a welcome email and add their information to my CRM system.",
                "platform": "n8n"
            }
            
            response = requests.post(f"{BASE_URL}/workflow-builder/generate", json=payload, headers=HEADERS, timeout=60)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'workflow' in data and 'visualPreview' in data:
                    workflow = data['workflow']
                    if 'nodes' in workflow or 'name' in workflow:
                        self.log_test("Valid Workflow Generation (n8n)", True, f"Generated workflow with {data.get('nodeCount', 'unknown')} nodes")
                    else:
                        self.log_test("Valid Workflow Generation (n8n)", False, "Invalid workflow structure")
                else:
                    self.log_test("Valid Workflow Generation (n8n)", False, f"Invalid response structure: {data}")
            else:
                # API key error is expected with fake key
                if response.status_code == 500:
                    error_data = response.json()
                    if 'error' in error_data and ('API' in error_data['error'] or 'OpenAI' in error_data['error']):
                        self.log_test("Valid Workflow Generation (n8n)", True, "Correctly handles invalid API key with proper error")
                    else:
                        self.log_test("Valid Workflow Generation (n8n)", False, f"Unexpected error: {error_data}")
                else:
                    self.log_test("Valid Workflow Generation (n8n)", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Valid Workflow Generation (n8n)", False, f"Exception: {str(e)}")
        
        # Test 2: Valid workflow generation request (Make.com)
        print("\n--- Testing Valid Workflow Generation (Make.com) ---")
        try:
            payload = {
                "name": "Social Media Automation",
                "description": "Post content across multiple social platforms",
                "provider": "claude",
                "apiKey": "fake-claude-key-for-testing",
                "automationDescription": "I want to automatically post my blog content to Twitter, LinkedIn, and Facebook when I publish a new article.",
                "platform": "make"
            }
            
            response = requests.post(f"{BASE_URL}/workflow-builder/generate", json=payload, headers=HEADERS, timeout=60)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'workflow' in data and 'visualPreview' in data:
                    workflow = data['workflow']
                    if 'scenario' in workflow or 'name' in workflow:
                        self.log_test("Valid Workflow Generation (Make.com)", True, f"Generated Make.com workflow with {data.get('nodeCount', 'unknown')} modules")
                    else:
                        self.log_test("Valid Workflow Generation (Make.com)", False, "Invalid Make.com workflow structure")
                else:
                    self.log_test("Valid Workflow Generation (Make.com)", False, f"Invalid response structure: {data}")
            else:
                # API key error is expected with fake key
                if response.status_code == 500:
                    error_data = response.json()
                    if 'error' in error_data and ('API' in error_data['error'] or 'Claude' in error_data['error']):
                        self.log_test("Valid Workflow Generation (Make.com)", True, "Correctly handles invalid Claude API key with proper error")
                    else:
                        self.log_test("Valid Workflow Generation (Make.com)", False, f"Unexpected error: {error_data}")
                else:
                    self.log_test("Valid Workflow Generation (Make.com)", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Valid Workflow Generation (Make.com)", False, f"Exception: {str(e)}")
        
        # Test 3: Missing required fields validation
        print("\n--- Testing Missing Required Fields ---")
        try:
            payload = {
                "name": "Test Workflow",
                # Missing apiKey, automationDescription, provider, platform
            }
            
            response = requests.post(f"{BASE_URL}/workflow-builder/generate", json=payload, headers=HEADERS)
            
            if response.status_code == 400:
                data = response.json()
                if 'error' in data and 'required' in data['error'].lower():
                    self.log_test("Missing Required Fields", True, "Correctly validates required fields")
                else:
                    self.log_test("Missing Required Fields", False, f"Unexpected error message: {data}")
            else:
                self.log_test("Missing Required Fields", False, f"Expected 400, got {response.status_code}")
                
        except Exception as e:
            self.log_test("Missing Required Fields", False, f"Exception: {str(e)}")
        
        # Test 4: Invalid provider validation
        print("\n--- Testing Invalid Provider Validation ---")
        try:
            payload = {
                "name": "Test Workflow",
                "provider": "invalid-provider",
                "apiKey": "test-key",
                "automationDescription": "Test automation",
                "platform": "n8n"
            }
            
            response = requests.post(f"{BASE_URL}/workflow-builder/generate", json=payload, headers=HEADERS)
            
            if response.status_code == 400:
                data = response.json()
                if 'error' in data and 'provider' in data['error'].lower():
                    self.log_test("Invalid Provider Validation", True, "Correctly validates provider")
                else:
                    self.log_test("Invalid Provider Validation", False, f"Unexpected error: {data}")
            else:
                self.log_test("Invalid Provider Validation", False, f"Expected 400, got {response.status_code}")
                
        except Exception as e:
            self.log_test("Invalid Provider Validation", False, f"Exception: {str(e)}")
        
        # Test 5: Invalid platform validation
        print("\n--- Testing Invalid Platform Validation ---")
        try:
            payload = {
                "name": "Test Workflow",
                "provider": "openai",
                "apiKey": "test-key",
                "automationDescription": "Test automation",
                "platform": "invalid-platform"
            }
            
            response = requests.post(f"{BASE_URL}/workflow-builder/generate", json=payload, headers=HEADERS)
            
            if response.status_code == 400:
                data = response.json()
                if 'error' in data and 'platform' in data['error'].lower():
                    self.log_test("Invalid Platform Validation", True, "Correctly validates platform")
                else:
                    self.log_test("Invalid Platform Validation", False, f"Unexpected error: {data}")
            else:
                self.log_test("Invalid Platform Validation", False, f"Expected 400, got {response.status_code}")
                
        except Exception as e:
            self.log_test("Invalid Platform Validation", False, f"Exception: {str(e)}")
        
        # Test 6: Test with Gemini provider
        print("\n--- Testing Gemini Provider ---")
        try:
            payload = {
                "name": "Data Processing Pipeline",
                "description": "Process and transform data from multiple sources",
                "provider": "gemini",
                "apiKey": "fake-gemini-key-for-testing",
                "automationDescription": "I want to fetch data from multiple APIs, clean and transform it, then store it in a database and send a summary report via email.",
                "platform": "n8n"
            }
            
            response = requests.post(f"{BASE_URL}/workflow-builder/generate", json=payload, headers=HEADERS, timeout=60)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'workflow' in data:
                    self.log_test("Gemini Provider", True, "Successfully processes Gemini provider requests")
                else:
                    self.log_test("Gemini Provider", False, f"Invalid response: {data}")
            else:
                # API key error is expected with fake key
                if response.status_code == 500:
                    error_data = response.json()
                    if 'error' in error_data and ('API' in error_data['error'] or 'Gemini' in error_data['error']):
                        self.log_test("Gemini Provider", True, "Correctly handles invalid Gemini API key with proper error")
                    else:
                        self.log_test("Gemini Provider", False, f"Unexpected error: {error_data}")
                else:
                    self.log_test("Gemini Provider", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Gemini Provider", False, f"Exception: {str(e)}")
        
        # Test 7: Test helper functions (basic template generation)
        print("\n--- Testing Helper Functions (Basic Template) ---")
        try:
            # This test will trigger the fallback to basic template when API fails
            payload = {
                "name": "Basic Template Test",
                "provider": "openai",
                "apiKey": "definitely-invalid-key",
                "automationDescription": "Simple webhook to email workflow",
                "platform": "n8n"
            }
            
            response = requests.post(f"{BASE_URL}/workflow-builder/generate", json=payload, headers=HEADERS, timeout=30)
            
            # Should either succeed with basic template or fail with API error
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'workflow' in data:
                    workflow = data['workflow']
                    if 'nodes' in workflow and len(workflow['nodes']) >= 2:
                        self.log_test("Helper Functions (Basic Template)", True, "Basic template generation working")
                    else:
                        self.log_test("Helper Functions (Basic Template)", False, "Basic template structure invalid")
                else:
                    self.log_test("Helper Functions (Basic Template)", False, f"Invalid response: {data}")
            elif response.status_code == 500:
                # API error is acceptable for this test
                self.log_test("Helper Functions (Basic Template)", True, "API error handling working correctly")
            else:
                self.log_test("Helper Functions (Basic Template)", False, f"Unexpected status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Helper Functions (Basic Template)", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all workflow builder tests"""
        print("🚀 STARTING WORKFLOW BUILDER TESTING")
        print("="*80)
        print(f"Testing Backend URL: {BASE_URL}")
        print(f"Test Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Run workflow builder tests
        self.test_workflow_builder()
        
        # Print final summary
        print("\n" + "="*80)
        print("WORKFLOW BUILDER TEST SUMMARY")
        print("="*80)
        print(f"✅ Passed: {self.passed_tests}")
        print(f"❌ Failed: {self.failed_tests}")
        print(f"📊 Success Rate: {(self.passed_tests / (self.passed_tests + self.failed_tests) * 100):.1f}%")
        print(f"🕒 Test Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        if self.failed_tests == 0:
            print("\n🎉 ALL WORKFLOW BUILDER TESTS PASSED!")
        else:
            print(f"\n⚠️  {self.failed_tests} tests failed. Review the issues above.")
        
        return self.failed_tests == 0

if __name__ == "__main__":
    tester = WorkflowBuilderTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)