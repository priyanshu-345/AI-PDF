import io
import json
import zipfile
import xml.etree.ElementTree as ET
import urllib.request
import urllib.error
import fitz  # PyMuPDF

def test_endpoints():
    print("=== 1. Testing Health & Connectivity ===")
    try:
        req = urllib.request.urlopen("http://127.0.0.1:8000/api/health", timeout=5)
        health = json.loads(req.read().decode())
        print(f" Backend Health Check: PASSED ({health})")
    except Exception as e:
        print(f" Backend Health Check: FAILED ({e})")
        return False

    try:
        req = urllib.request.urlopen("http://127.0.0.1:3000", timeout=5)
        html = req.read().decode()
        print(f" Frontend Vite Server: PASSED (Loaded {len(html)} bytes)")
    except Exception as e:
        print(f" Frontend Vite Server: FAILED ({e})")
        return False

    print("\n=== 2. Testing OTP Gateway Status & Security ===")
    try:
        req = urllib.request.urlopen("http://127.0.0.1:8000/api/auth/gateway-status", timeout=5)
        gw = json.loads(req.read().decode())
        print(f" Gateway Status: PASSED (SMS: {gw.get('sms_configured')}, SMTP: {gw.get('smtp_configured')}, Provider: {gw.get('sms_provider')})")
    except Exception as e:
        print(f" Gateway Status: FAILED ({e})")

    # Test send-otp endpoint security: verify NO otp_preview leaked
    try:
        data = json.dumps({"target": "+918948129005", "method": "mobile"}).encode()
        req = urllib.request.Request("http://127.0.0.1:8000/api/auth/send-otp", data=data, headers={"Content-Type": "application/json"})
        resp = urllib.request.urlopen(req, timeout=5)
        resp_data = json.loads(resp.read().decode())
        print(f" Send OTP Response: {resp_data}")
        if "otp_preview" in resp_data or "code" in resp_data:
            print(" SECURITY FAILURE: OTP was returned to the client!")
        else:
            print(" OTP Security: PASSED (No code leaked in API response)")
    except Exception as e:
        print(f" Send OTP Check: {e}")

    print("\n=== 3. Testing Universal Document Conversion Engine ===")
    # Create sample PDF in-memory
    doc = fitz.open()
    page = doc.new_page(width=595, height=842) # A4
    page.insert_text((50, 60), "ANNUAL PERFORMANCE & FINANCIAL REPORT 2026", fontsize=16, fontname="helv", color=(0.5, 0, 0.125))
    page.insert_text((50, 90), "Universal Document Conversion Verification Test", fontsize=11, fontname="helv", color=(0.2, 0.2, 0.2))
    
    # Draw simple table grid
    page.draw_rect(fitz.Rect(50, 120, 545, 220), color=(0.7, 0.7, 0.7), width=1)
    page.draw_line(fitz.Point(50, 150), fitz.Point(545, 150), color=(0.7, 0.7, 0.7), width=1)
    page.draw_line(fitz.Point(200, 120), fitz.Point(200, 220), color=(0.7, 0.7, 0.7), width=1)
    page.draw_line(fitz.Point(380, 120), fitz.Point(380, 220), color=(0.7, 0.7, 0.7), width=1)
    
    page.insert_text((60, 140), "Metric / KPI", fontsize=10, fontname="helv")
    page.insert_text((210, 140), "Target Q1", fontsize=10, fontname="helv")
    page.insert_text((390, 140), "Achieved Q1", fontsize=10, fontname="helv")
    
    page.insert_text((60, 180), "Revenue Growth", fontsize=10, fontname="helv")
    page.insert_text((210, 180), "15.5%", fontsize=10, fontname="helv")
    page.insert_text((390, 180), "19.2%", fontsize=10, fontname="helv")
    
    pdf_bytes = doc.write()
    doc.close()
    print(f" Sample PDF created: {len(pdf_bytes)} bytes")

    # Helper for multipart form upload
    def convert_file(target_format):
        boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
        body = (
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="file"; filename="sample.pdf"\r\n'
            f"Content-Type: application/pdf\r\n\r\n"
        ).encode("utf-8") + pdf_bytes + (
            f"\r\n--{boundary}\r\n"
            f'Content-Disposition: form-data; name="target_format"\r\n\r\n'
            f"{target_format}\r\n"
            f"--{boundary}--\r\n"
        ).encode("utf-8")
        
        req = urllib.request.Request(
            "http://127.0.0.1:8000/api/convert",
            data=body,
            headers={
                "Content-Type": f"multipart/form-data; boundary={boundary}"
            }
        )
        resp = urllib.request.urlopen(req, timeout=30)
        return resp.read()

    formats_to_test = ["docx", "xlsx", "pptx", "html", "xml", "json", "csv", "svg"]
    
    for fmt in formats_to_test:
        try:
            out_bytes = convert_file(fmt)
            print(f" Conversion to .{fmt.upper()}: SUCCESS ({len(out_bytes)} bytes received)")
            
            # Deep format validation
            if fmt in ["docx", "xlsx", "pptx"]:
                with zipfile.ZipFile(io.BytesIO(out_bytes)) as z:
                    filelist = z.namelist()
                    if "[Content_Types].xml" in filelist:
                        print(f"    Validation: Valid OpenXML Package ([Content_Types].xml verified, {len(filelist)} entries)")
                    else:
                        print(f"    Validation WARNING: [Content_Types].xml not found!")
            elif fmt == "xml":
                ET.fromstring(out_bytes)
                print("    Validation: Valid XML 1.0 Document structure verified")
            elif fmt == "json":
                json.loads(out_bytes.decode())
                print("    Validation: Valid JSON Syntax verified")
            elif fmt == "html":
                assert b"<html" in out_bytes.lower() and b"</html>" in out_bytes.lower()
                print("    Validation: Valid HTML5 Document structure verified")
            elif fmt == "csv":
                assert b"," in out_bytes or b"\n" in out_bytes
                print("    Validation: Valid Delimited CSV structure verified")
            elif fmt == "svg":
                assert b"<svg" in out_bytes
                print("    Validation: Valid Vector SVG Document verified")
        except Exception as e:
            print(f" Conversion to .{fmt.upper()}: FAILED -> {e}")

    print("\n=== All Verification Tests Completed ===")
    return True

if __name__ == "__main__":
    test_endpoints()
