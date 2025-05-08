
##############################################################
#  VULNERABLE API – FOR SECURITY RESEARCH & EDUCATIONAL USE  #
##############################################################
An intentionally vulnerable REST API for AppSec training, pentesting practice, and educational use.
Use this project in **isolated lab environments** only.


//////////////////////////////////////////////////////////////
## VULNRABILITIES INCLUDED ##
/////////////////////////////////////////////////////////////
This API simulates a range of common web flaws:
- **Insecure authentication**
- **Brute-forceable login**
- **Access control issues (IDOR)**
- **Injection flaws**
- **Exposed sensitive data**
- **Broken session/token handling**
- **Insecure deserialization**
- **Improper input validation**
- **Reflected & stored XSS**
- **Security misconfigurations**- **Insecure authentication**
- **Brute-forceable login**
- **Access control issues (IDOR)**
- **Injection flaws**
- **Exposed sensitive data**
- **Broken session/token handling**
- **Insecure deserialization**
- **Improper input validation**
- **Reflected & stored XSS**
- **Security misconfigurations**
Each endpoint is built to demonstrate one or more of these vulnerabilities.


//////////////////////////////////////////////////////////////
⚠️ DISCLAIMER ⚠️
//////////////////////////////////////////////////////////////
This project is for educational use only. Do not use it on systems you don't own or have permission to test.
The author takes **no responsibility for misuse or damage** caused by this project.

❗Intentionally hardcoded secrets and insecure config for AppSec training❗

##############################################################
## USE CASES ##                                           
##############################################################

This project is intended for hands-on exploration of application security concepts, including:

- Manual testing with tools like Burp Suite, Postman, and curl
- Development and validation of custom security tools or scripts
- Practicing identification and exploitation of common web vulnerabilities


##############################################################
## GET STARTED ##                                           
##############################################################

```bash
git clone https://github.com/DanielBostrom/vulnerable-api-appsec-training.git
cd vulnerable-api-appsec-training
docker-compose up
```

Once running, the API will be available at:  
➡️ **http://localhost:8000**

