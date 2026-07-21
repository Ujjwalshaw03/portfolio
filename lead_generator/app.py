import os
import json
import re
import urllib.parse
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder='static')

# Serve the frontend
@app.route('/')
def serve_index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

@app.route('/api/generate', methods=['POST'])
def generate_leads():
    data = request.json
    query = data.get('query', '')
    serp_api_key = data.get('serpApiKey', '')
    llm_api_key = data.get('llmApiKey', '')
    
    if not query:
        return jsonify({"error": "Query is required"}), 400
        
    if not serp_api_key or not llm_api_key:
        # Mock mode if no API keys are provided so the user can see the UI working
        return jsonify({
            "status": "success",
            "message": "MOCK DATA: Please provide API keys in the settings to get real data.",
            "leads": [
                {
                    "count": 1,
                    "firstName": "John",
                    "lastName": "Doe",
                    "companyName": "Creator Corp",
                    "companyWebsite": "https://creatorcorp.com",
                    "socialLink": "https://instagram.com/johndoe",
                    "email": "johndoe@gmail.com"
                },
                {
                    "count": 2,
                    "firstName": "Jane",
                    "lastName": "Smith",
                    "companyName": "Smith Media",
                    "companyWebsite": "https://smithmedia.io",
                    "socialLink": "https://linkedin.com/in/janesmith",
                    "email": "jane.smith@gmail.com"
                },
                # This entry should be filtered out by frontend or backend because it's missing email, but we'll include it to test filtering if we want, or just return valid mock data
            ]
        })
    
    # Real implementation placeholder
    # 1. Fetch Google Search results via SerpApi
    import requests
    
    try:
        # SERP API Call
        serp_url = f"https://serpapi.com/search.json?engine=google&q={urllib.parse.quote(query)}&api_key={serp_api_key}&num=20"
        serp_response = requests.get(serp_url)
        serp_data = serp_response.json()
        
        if "organic_results" not in serp_data:
            return jsonify({"error": "Failed to get search results", "details": serp_data}), 500
            
        snippets = []
        for result in serp_data["organic_results"]:
            snippets.append({
                "title": result.get("title", ""),
                "link": result.get("link", ""),
                "snippet": result.get("snippet", "")
            })
            
        # 2. Process with LLM API (Using Gemini API as an example)
        # We prompt the LLM to extract the data in a strict JSON format
        prompt = f"""
        You are a data extraction bot. I will give you search snippets. 
        Extract any leads found into a JSON array of objects.
        Each object must have exactly these keys: "firstName", "lastName", "companyName", "companyWebsite", "socialLink", "email".
        Only include entries that have BOTH a firstName and an email.
        If a field is missing, use an empty string "".
        Do not include duplicate emails.
        
        Snippets:
        {json.dumps(snippets, indent=2)}
        
        Respond ONLY with the JSON array, nothing else.
        """
        
        # Call Gemini API
        gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={llm_api_key}"
        llm_payload = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        
        llm_response = requests.post(gemini_url, json=llm_payload)
        llm_data = llm_response.json()
        
        if "candidates" in llm_data:
            text_result = llm_data["candidates"][0]["content"]["parts"][0]["text"]
            # Clean up potential markdown formatting from LLM
            text_result = re.sub(r'```json\n|\n```', '', text_result).strip()
            
            try:
                extracted_leads = json.loads(text_result)
                
                # Post-processing: Add count, filter, deduplicate
                final_leads = []
                seen_emails = set()
                count = 1
                
                for lead in extracted_leads:
                    email = lead.get("email", "").strip().lower()
                    first_name = lead.get("firstName", "").strip()
                    
                    if not email or not first_name:
                        continue
                        
                    if email in seen_emails:
                        continue
                        
                    seen_emails.add(email)
                    lead["count"] = count
                    final_leads.append(lead)
                    count += 1
                    
                return jsonify({"status": "success", "leads": final_leads})
            except Exception as e:
                return jsonify({"error": "Failed to parse LLM response", "details": str(e), "raw": text_result}), 500
        else:
            return jsonify({"error": "LLM API returned unexpected format", "details": llm_data}), 500
            
    except Exception as e:
        return jsonify({"error": "An error occurred", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
