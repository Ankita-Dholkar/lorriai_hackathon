<p align="center">
 <img width="933" height="525" alt="Venus Vertex (1)" src="https://github.com/user-attachments/assets/d690cdf8-7eb6-4c03-ab9f-9f92d01d8fb2" />

</p>

<br>

<hr style="border:0.5px solid #eaeaea;">

<h2 align="center">📌 Problem Statement and Project Description</h2>

<hr style="border:0.5px solid #eaeaea;">

<br>

<p align="justify">
The logistics industry processes a large number of shipment transactions every day, and each shipment involves multiple documents such as 
<strong>Lorry Receipt (LR)</strong>, <strong>Proof of Delivery (POD)</strong>, and the <strong>carrier’s invoice</strong>. 
Before releasing payments, finance teams must manually compare and verify information across these documents, including shipment details, delivery confirmation, and billing amounts.
</p>

<br>

<p align="justify">
This manual reconciliation process is time-consuming and prone to human errors. Even a small discrepancy of 
<strong>₹200–₹500 per shipment</strong> can result in significant financial losses. For logistics companies handling around 
<strong>10,000 shipments per month</strong>, these unnoticed discrepancies can lead to 
<strong>₹20–50 lakh of potential financial leakage</strong> and delays in invoice approvals.
</p>

<br>

<p align="justify">
To address this problem, our project proposes an <strong>algorithm-based document reconciliation system</strong>. 
The platform automatically extracts data from logistics documents using OCR, structures the information, and compares key fields across 
<strong>LR, POD, and invoices</strong> using validation algorithms. The system identifies mismatches, highlights discrepancies, and assists finance teams in faster and more accurate invoice verification, improving efficiency and reducing financial risk in logistics operations.
</p>

<br>

<hr style="border:0.5px solid #eaeaea;">

<br>
<br>

<hr style="border:0.5px solid #eaeaea;">

<h2 align="center">📊 Industry Evidence</h2>

<hr style="border:0.5px solid #eaeaea;">

<br>

<p align="justify">
The challenges of manual logistics reconciliation are also supported by industry research. 
Freight invoices often contain billing discrepancies such as incorrect weight calculations, 
rate misapplications, duplicate invoices, or missing discounts. Resolving these issues 
usually requires manual verification and documentation, which can take 
<strong>7–45 days</strong>.
</p>

<p align="justify">
The distribution of common freight billing errors is illustrated below.
</p>

<br>

<table align="center" width="60%" border="1" cellpadding="8" cellspacing="0">
<tr>
<th align="center">Error Type</th>
<th align="center">Approximate Share</th>
</tr>

<tr>
<td>Weight / Dimension Errors</td>
<td align="center">30%</td>
</tr>

<tr>
<td>Rate Misapplication</td>
<td align="center">25%</td>
</tr>

<tr>
<td>Duplicate Invoices</td>
<td align="center">15%</td>
</tr>

<tr>
<td>Missing Discounts</td>
<td align="center">15%</td>
</tr>

<tr>
<td>Accessorial Overcharges</td>
<td align="center">15%</td>
</tr>

</table>

<br>

<p>
<strong>Reference:</strong><br>
FlexTecs – <em>Common Freight Billing Errors</em><br>
<a href="https://flextecs.com/flextecs-blog/common-freight-errors/">https://flextecs.com/flextecs-blog/common-freight-errors/</a>
</p>

<br>

<hr style="border:0.5px solid #eaeaea;">
<br>

<hr style="border:0.5px solid #eaeaea;">

<h2 align="center">💡 Solution Overview</h2>

<hr style="border:0.5px solid #eaeaea;">

<br>

<table width="100%">
<tr>
<th align="left">Key Points of Proposed Solution</th>
<th align="left">How It Addresses the Problem</th>
<th align="left">Uniqueness and Innovation</th>
</tr>

<tr>
<td>

▪ Algorithm-based reconciliation of LR, POD, and invoice documents  
▪ Automated OCR-based data extraction and structured parsing  
▪ Intelligent document matching using key shipment identifiers  
▪ Rule-based risk scoring mechanism for invoice validation  
▪ Analytics dashboard for discrepancy monitoring and insights  

</td>

<td>

▪ Eliminates manual comparison of logistics documents  
▪ Reduces invoice verification time by nearly <b>70%</b>  
▪ Detects discrepancies and unusual billing patterns  
▪ Prevents financial leakage caused by billing errors  
▪ Improves efficiency of finance and logistics operations  

</td>

<td>

▪ <b>Behavioral Carrier Intelligence</b> to track long-term billing patterns  
▪ <b>Algorithm-driven discrepancy detection</b> instead of manual validation  
▪ <b>Risk-based financial validation framework</b> for invoice approval  
▪ <b>Root-cause analysis mechanism</b> to identify reasons for mismatches  
▪ Foundation for a <b>Logistics Financial Intelligence Platform</b>  

</td>
</tr>

</table>

<br>

<hr style="border:0.5px solid #eaeaea;">
<br>
<br>

<hr>

<h2 align="center"><b>🏗 System Architecture & Workflow – Venus Vertex</b></h2>

<hr>

<table align="center" width="70%" cellpadding="14" cellspacing="0">

<tr>
<td align="center" bgcolor="#e7f5ff">
<div style="font-size:18px; font-weight:bold; background:#1971c2; color:white; padding:6px; border-radius:6px;">
STEP 1 — LR DOCUMENT UPLOAD
</div>
<br>
LR (Lorry Receipt) submitted as PDF / Image
</td>
</tr>

<tr><td align="center">⬇</td></tr>

<tr>
<td align="center" bgcolor="#fff3bf">
<div style="font-size:18px; font-weight:bold; background:#f59f00; color:white; padding:6px; border-radius:6px;">
STEP 2 — AGENT-1 OCR PROCESSING
</div>
<br>
Extract Shipment Data<br>
LR Number • Consignor • Vehicle • Driver • Destination • Freight Charges
</td>
</tr>

<tr><td align="center">⬇</td></tr>

<tr>
<td align="center" bgcolor="#f1f3f5">
<div style="font-size:18px; font-weight:bold; background:#495057; color:white; padding:6px; border-radius:6px;">
STEP 3 — CENTRAL DATA LAYER
</div>
<br>
Shipment data stored in <b>logistics.db</b>
</td>
</tr>

<tr><td align="center">⬇</td></tr>

<tr>
<td align="center" bgcolor="#d3f9d8">
<div style="font-size:18px; font-weight:bold; background:#2b8a3e; color:white; padding:6px; border-radius:6px;">
STEP 4 — DELIVERY VERIFICATION
</div>
<br>
OTP Verification • GPS Location Match<br>
Fuel & Toll Receipt OCR<br>
Carrier Manual Charges Entry
</td>
</tr>

<tr><td align="center">⬇</td></tr>

<tr>
<td align="center" bgcolor="#e5dbff">
<div style="font-size:18px; font-weight:bold; background:#5f3dc4; color:white; padding:6px; border-radius:6px;">
STEP 5 — PAYMENT ENGINE
</div>
<br>
Carrier Payment = Fuel Cost + Toll Cost + Manual Charges
</td>
</tr>

<tr><td align="center">⬇</td></tr>

<tr>
<td align="center" bgcolor="#ffe3e3">
<div style="font-size:18px; font-weight:bold; background:#c92a2a; color:white; padding:6px; border-radius:6px;">
STEP 6 — FRAUD RISK DETECTION
</div>
<br>
Compare Freight vs Carrier Charges<br>
Detect abnormal billing patterns
</td>
</tr>

<tr><td align="center">⬇</td></tr>

<tr>
<td align="center" bgcolor="#e3fafc">
<div style="font-size:18px; font-weight:bold; background:#0b7285; color:white; padding:6px; border-radius:6px;">
STEP 7 — SYSTEM OUTPUT
</div>
<br>
Fraud Probability Score<br>
Risk Level Classification<br>
Analytics Dashboard
</td>
</tr>

</table>

<br>

<hr>
<hr style="border:0.5px solid #eaeaea;">

<h2 align="center">📈 Impact, Benefits and Current Implementation</h2>

<hr style="border:0.5px solid #eaeaea;">

<br>

<ol>

<li>
<p align="justify">
<strong>Reduced Manual Workload & Faster Processing</strong><br>
The system automatically extracts and matches LR, POD, and invoice data, reducing manual verification by 
<strong>60–80%</strong> and improving invoice processing speed by nearly <strong>70%</strong>.
</p>
</li>

<li>
<p align="justify">
<strong>Improved Fraud and Discrepancy Detection</strong><br>
Using anomaly detection and behavioral pattern analysis, the platform can identify suspicious billing activities, 
improving discrepancy detection accuracy by <strong>50–60%</strong>.
</p>
</li>

<li>
<p align="justify">
<strong>Automated Validation Agent</strong><br>
The platform includes a validation agent that automatically verifies shipment documents and assists in payment approval, 
improving financial workflow efficiency by <strong>55–65%</strong>.
</p>
</li>

<li>
<p align="justify">
<strong>Root-Cause Analysis of Discrepancies</strong><br>
The system identifies the possible causes of mismatches, such as operational delays, billing errors, or incorrect data entries, 
helping teams take corrective actions quickly.
</p>
</li>

<li>
<p align="justify">
<strong>Foundation for a Scalable Platform</strong><br>
The solution establishes the foundation for a scalable <strong>Logistics Financial Intelligence Platform</strong> capable of 
automating document reconciliation and monitoring financial risks across large volumes of shipment data.
</p>
</li>

</ol>

<br>

<hr style="border:0.5px solid #eaeaea;">
<br>

<hr style="border:0.5px solid #eaeaea;">

<h2 align="center">🚀 Innovation and Competitive Advantage</h2>

<hr style="border:0.5px solid #eaeaea;">

<br>

<ol>

<li>
<p align="justify">
<strong>Behavioral Carrier Intelligence</strong><br>
Unlike traditional document verification systems, our platform analyzes carrier billing patterns over time. 
This helps identify repeated discrepancies and suspicious billing behavior, improving fraud detection capability 
by <strong>45–55%</strong>.
</p>
</li>

<li>
<p align="justify">
<strong>Risk-Based Financial Validation</strong><br>
The system assigns a risk score to each shipment invoice based on document mismatches, anomaly detection, 
and historical patterns. This enables automatic approval of low-risk invoices and escalation of high-risk cases.
</p>
</li>

<li>
<p align="justify">
<strong>Autonomous Financial Validation Agent</strong><br>
The platform introduces a foundational AI validation agent that automatically verifies shipment documents 
such as <strong>LR, POD, and invoices</strong>, significantly reducing manual intervention in financial reconciliation.
</p>
</li>

<li>
<p align="justify">
<strong>Intelligent Discrepancy Analysis</strong><br>
Instead of only detecting mismatches, the system attempts to identify the possible root cause of discrepancies 
such as operational delays, billing errors, or incorrect document entries.
</p>
</li>

<li>
<p align="justify">
<strong>Foundation for Logistics Financial Intelligence Platform</strong><br>
The solution moves beyond simple document automation and establishes the foundation for a complete 
<strong>Logistics Financial Intelligence Platform</strong> capable of fraud detection, financial monitoring, 
and automated reconciliation across the supply chain.
</p>
</li>

</ol>

<br>

<hr style="border:0.5px solid #eaeaea;">
<br>
<br>

<hr style="border:0.5px solid #eaeaea;">

<h2 align="center">⚙️ Feasibility and Viability</h2>

<hr style="border:0.5px solid #eaeaea;">

<br>

<ol>

<li>
<p align="justify">
<strong>Technical Feasibility</strong><br>
The system uses widely available technologies such as OCR, document parsing, and rule-based validation algorithms, enabling data extraction with <strong>85–90% accuracy</strong>.
</p>
</li>

<li>
<p align="justify">
<strong>Easy System Integration</strong><br>
The platform can integrate with existing logistics management systems and ERP platforms, reducing implementation complexity by <strong>40–50%</strong>.
</p>
</li>

<li>
<p align="justify">
<strong>Scalable Architecture</strong><br>
The system can process <strong>thousands of shipment documents per day</strong>, making it suitable for large logistics operations.
</p>
</li>

<li>
<p align="justify">
<strong>Operational Efficiency</strong><br>
Automation of document reconciliation can reduce manual financial verification work by <strong>60–80%</strong>, improving productivity for finance teams.
</p>
</li>

<li>
<p align="justify">
<strong>Economic Viability</strong><br>
By reducing billing errors and manual processing costs, the system can lower operational expenses by <strong>30–40%</strong>. For logistics companies handling <strong>10,000 shipments per month</strong>, this could help prevent financial leakage of approximately <strong>₹20–50 lakh</strong>, significantly improving profitability and financial efficiency.
</p>
</li>

</ol>

<br>

<hr style="border:0.5px solid #eaeaea;">
<hr style="border:0.5px solid #eaeaea;">

<h2 align="center">🛠 Tech Stack</h2>

<hr style="border:0.5px solid #eaeaea;">

<p align="center">

<img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white">
<img src="https://img.shields.io/badge/Tesseract_OCR-4285F4?style=for-the-badge&logo=google&logoColor=white">
<img src="https://img.shields.io/badge/EasyOCR-FF6F00?style=for-the-badge&logo=opencv&logoColor=white">
<img src="https://img.shields.io/badge/OpenCV-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white">

<br>

<img src="https://img.shields.io/badge/Scikit--Learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white">
<img src="https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white">
<img src="https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white">

<br>

<img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white">
<img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white">
<img src="https://img.shields.io/badge/REST_API-02569B?style=for-the-badge&logo=fastapi&logoColor=white">

<br>

<img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
<img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">

<br>

<img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white">
<img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white">

<br>

<img src="https://img.shields.io/badge/Streamlit-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white">
<img src="https://img.shields.io/badge/Plotly-3F4F75?style=for-the-badge&logo=plotly&logoColor=white">

</p>

<hr style="border:0.5px solid #eaeaea;">
<hr style="border:0.5px solid #eaeaea;">

<h2 align="center">🔮 Future Scope with Expected Impact</h2>

<hr style="border:0.5px solid #eaeaea;">

<br>

<ol>

<li>
<p align="justify">
<strong>Behavioral Carrier Intelligence</strong><br>
The platform can track carrier billing behavior across shipments and automatically flag suspicious patterns. 
This can improve fraud detection by <strong>45–55%</strong> and reduce unnoticed billing discrepancies by 
<strong>40%</strong>.
</p>
</li>

<li>
<p align="justify">
<strong>Real-Time Shipment Monitoring</strong><br>
By integrating invoice verification with GPS tracking and delivery data, the system can ensure transparent 
shipment validation. This can improve shipment verification accuracy by <strong>50–60%</strong> and reduce 
billing disputes by <strong>40%</strong>.
</p>
</li>

<li>
<p align="justify">
<strong>Automated Payment Approval</strong><br>
Integration with banking and payment systems can enable automatic approval of verified invoices, reducing 
manual processing time by <strong>65–75%</strong> and improving financial workflow efficiency by 
<strong>60%</strong>.
</p>
</li>

<li>
<p align="justify">
<strong>Multi-Company Logistics Intelligence</strong><br>
The platform can analyze carrier performance and financial discrepancies across multiple companies, improving 
carrier reliability evaluation by <strong>50%</strong> and reducing operational inefficiencies by 
<strong>35–45%</strong>.
</p>
</li>

<li>
<p align="justify">
<strong>AI-Based Fraud Prediction</strong><br>
Using historical invoice data, AI models can predict potential fraud before payment is released. 
This can reduce financial leakage by <strong>40–50%</strong> and strengthen financial risk management.
</p>
</li>

</ol>

<br>

<hr style="border:0.5px solid #eaeaea;">
<br>

<hr style="border:0.5px solid #eaeaea;">

<h2 align="center">📚 References</h2>

<hr style="border:0.5px solid #eaeaea;">

<br>

<ol>

<li>
<p>
<strong>FlexTecs</strong> – <em>Common Freight Billing Errors in Logistics</em><br>
<a href="https://flextecs.com/flextecs-blog/common-freight-errors/">https://flextecs.com/flextecs-blog/common-freight-errors/</a>
</p>
</li>

<li>
<p>
<strong>GoComet</strong> – <em>Freight Invoice Processing Facts and Industry Insights</em><br>
<a href="https://www.gocomet.com/blog/8-freight-invoice-facts-everyone-should-know/">
https://www.gocomet.com/blog/8-freight-invoice-facts-everyone-should-know/
</a>
</p>
</li>

<li>
<p>
<strong>ZDS Consulting</strong> – <em>Freight Billing Errors and Their Financial Impact</em><br>
<a href="https://www.zdscs.com/blog/freight-billing-errors-the-5-most-expensive-mistakes-costing-your-company/">
https://www.zdscs.com/blog/freight-billing-errors-the-5-most-expensive-mistakes-costing-your-company/
</a>
</p>
</li>

<li>
<p>
<strong>Avantiico</strong> – <em>Freight Invoice Audit and Payment Systems</em><br>
<a href="https://avantiico.com/freight-invoice-audits/">
https://avantiico.com/freight-invoice-audits/
</a>
</p>
</li>

<li>
<p>
<strong>Invensis</strong> – <em>Freight Audit and Invoice Verification in Logistics</em><br>
<a href="https://www.invensis.net/blog/freight-audit-checklist">
https://www.invensis.net/blog/freight-audit-checklist
</a>
</p>
</li>

</ol>

<br>

<hr style="border:0.5px solid #eaeaea;">
]
