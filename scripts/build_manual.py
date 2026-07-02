#!/usr/bin/env python3
"""Build bilingual structured manual JSON from PDFs and docx."""
import PyPDF2, json, os, re
from pathlib import Path

BASE = Path("/Users/leilefan/Library/Mobile Documents/iCloud~md~obsidian/Documents")
PROJ = BASE / "Fanleile/Project/08_software development"
OUT = PROJ / "ffd400eel-app/public/data"
OUT.mkdir(parents=True, exist_ok=True)

EN = PROJ / "FFD400EEL/FFD400EEL_Instruction handbook.pdf"
CN = PROJ / "FFD450_中文手册.pdf"

CHAPTERS = [
    {"id":"safety","number":"I","titleEn":"SAFETY REGULATIONS","titleCn":"安全规程","sections":[
        {"id":"safety-1","number":"1","titleEn":"Operating Personnel","titleCn":"操作人员","subsections":[
            {"id":"safety-1-1","number":"1.1","titleEn":"Before Start up","titleCn":"开机前"},
            {"id":"safety-1-2","number":"1.2","titleEn":"Safety Guards","titleCn":"防护罩"},
            {"id":"safety-1-3","number":"1.3","titleEn":"Emergency Stop","titleCn":"紧急停止"},
            {"id":"safety-1-4","number":"1.4","titleEn":"Start up of the Drum","titleCn":"开启转鼓"},
            {"id":"safety-1-5","number":"1.5","titleEn":"Shut Down","titleCn":"关机"},
            {"id":"safety-1-6","number":"1.6","titleEn":"Cleaning the Drum","titleCn":"清洗转鼓"},
            {"id":"safety-1-7","number":"1.7","titleEn":"Cleaning the Holes of the Screening Section Shower Piping","titleCn":"清洗筛选段喷淋水管的孔"},
            {"id":"safety-1-8","number":"1.8","titleEn":"Cleaning the Holes of the Screening Section","titleCn":"清洗筛选段的孔"},
            {"id":"safety-1-9","number":"1.9","titleEn":"Cleaning the Bottom Vat","titleCn":"清洗底部槽体"},
            {"id":"safety-1-10","number":"1.10","titleEn":"Taking Stock Samples","titleCn":"取样"},
            {"id":"safety-1-11","number":"1.11","titleEn":"Adjustments, Fine Tuning During the Production","titleCn":"生产过程中的调整和微调"},
        ]},
        {"id":"safety-2","number":"2","titleEn":"Maintenance Personnel","titleCn":"维护人员","subsections":[
            {"id":"safety-2-1","number":"2.1","titleEn":"Prevent Free Movement of the Drum","titleCn":"阻止转鼓的自由移动"},
            {"id":"safety-2-2","number":"2.2","titleEn":"Use of Slow Drive (Auxiliary Drive)","titleCn":"低速驱动(辅助驱动)的使用"},
            {"id":"safety-2-3","number":"2.3","titleEn":"Work Inside the Drum and the Bottom Vat","titleCn":"在转鼓和槽体底部工作"},
            {"id":"safety-2-4","number":"2.4","titleEn":"Lifting the Drum","titleCn":"提升转鼓"},
            {"id":"safety-2-5","number":"2.5","titleEn":"Dismantling the Machine","titleCn":"拆卸设备"},
            {"id":"safety-2-6","number":"2.6","titleEn":"Overall Safety Rules","titleCn":"全面的安全规程"},
            {"id":"safety-2-7","number":"2.7","titleEn":"Demolishing","titleCn":"拆毁"},
        ]},
        {"id":"safety-3","number":"3","titleEn":"Risk Factors and Protection","titleCn":"危险因素和防护","subsections":[
            {"id":"safety-3-1","number":"3.1","titleEn":"List of Risk Factors","titleCn":"危险因素清单"},
        ]},
        {"id":"safety-4","number":"4","titleEn":"Appendices to Safety Instructions","titleCn":"安全说明附件","subsections":[]},
    ]},
    {"id":"mechanical-startup","number":"II","titleEn":"MECHANICAL START-UP INSTRUCTIONS","titleCn":"设备开机说明","sections":[
        {"id":"mech-1","number":"1","titleEn":"Before Start-Up","titleCn":"开机前","subsections":[
            {"id":"mech-1-1","number":"1.1","titleEn":"Approved Control System Operation","titleCn":"控制系统"},
            {"id":"mech-1-2","number":"1.2","titleEn":"Lubrication","titleCn":"润滑"},
            {"id":"mech-1-3","number":"1.3","titleEn":"Signal Testing","titleCn":"信号测试"},
            {"id":"mech-1-4","number":"1.4","titleEn":"Free Rotation of Drum and Rotation Directions","titleCn":"自由旋转和旋转方向"},
            {"id":"mech-1-5","number":"1.5","titleEn":"Paper Feed and Reject Handling System","titleCn":"喂纸和排渣处理系统"},
            {"id":"mech-1-6","number":"1.6","titleEn":"Rope Sealing","titleCn":"绳索密封"},
        ]},
        {"id":"mech-2","number":"2","titleEn":"Start-Up for Mechanical Run","titleCn":"试运行开机","subsections":[
            {"id":"mech-2-1","number":"2.1","titleEn":"Observations During the Mechanical Run","titleCn":"试运行时的观察"},
            {"id":"mech-2-2","number":"2.2","titleEn":"Other Important Observations","titleCn":"其它重要观察点"},
            {"id":"mech-2-3","number":"2.3","titleEn":"Lubrication","titleCn":"润滑"},
            {"id":"mech-2-4","number":"2.4","titleEn":"Documentation","titleCn":"记录"},
        ]},
        {"id":"mech-3","number":"3","titleEn":"Water Run","titleCn":"试水","subsections":[
            {"id":"mech-3-1","number":"3.1","titleEn":"Before Water Run","titleCn":"试水前"},
            {"id":"mech-3-2","number":"3.2","titleEn":"Instruments Tuning","titleCn":"仪表调节"},
            {"id":"mech-3-3","number":"3.3","titleEn":"Observations During the Water Run","titleCn":"试水注意点"},
        ]},
    ]},
    {"id":"operating","number":"III","titleEn":"OPERATING INSTRUCTIONS","titleCn":"操作说明","sections":[
        {"id":"oper-1","number":"1","titleEn":"Process Description","titleCn":"过程描述","subsections":[]},
        {"id":"oper-2","number":"2","titleEn":"Setting Pulping Parameters","titleCn":"设置碎浆参数","subsections":[]},
        {"id":"oper-3","number":"3","titleEn":"Normal Start-Up and Shut Down","titleCn":"一般开机和停机","subsections":[
            {"id":"oper-3-1","number":"3.1","titleEn":"Normal Start-up Sequence Principle for Empty Drum","titleCn":"空转鼓的正常启动顺序"},
            {"id":"oper-3-2","number":"3.2","titleEn":"Normal Production Shut Down Principle","titleCn":"正常停机规程"},
        ]},
        {"id":"oper-4","number":"4","titleEn":"Fast Shut Down and Start-Up","titleCn":"快速停机和开机","subsections":[
            {"id":"oper-4-1","number":"4.1","titleEn":"Fast Shut Down","titleCn":"快速停机"},
            {"id":"oper-4-2","number":"4.2","titleEn":"Start-up After Fast Shut Down","titleCn":"快速停机后的开机"},
        ]},
        {"id":"oper-5","number":"5","titleEn":"Long Shut Down","titleCn":"长时间停机","subsections":[]},
        {"id":"oper-6","number":"6","titleEn":"Production Control","titleCn":"生产控制","subsections":[
            {"id":"oper-6-1","number":"6.1","titleEn":"Control Principle","titleCn":"控制原理"},
            {"id":"oper-6-2","number":"6.2","titleEn":"Typical Pulping Parameters","titleCn":"典型的碎浆参数"},
            {"id":"oper-6-3","number":"6.3","titleEn":"Use Trends","titleCn":"使用趋势图"},
        ]},
        {"id":"oper-7","number":"7","titleEn":"Other","titleCn":"其它","subsections":[
            {"id":"oper-7-1","number":"7.1","titleEn":"Remove Harmful Impurities from Furnish","titleCn":"捡出废纸中的有害杂质"},
            {"id":"oper-7-2","number":"7.2","titleEn":"Bottom Vat Cleanliness","titleCn":"清洗底部槽体"},
        ]},
    ]},
    {"id":"maintenance","number":"IV","titleEn":"MAINTENANCE INSTRUCTIONS","titleCn":"维护保养指南","sections":[
        {"id":"maint-1","number":"1","titleEn":"Electrical Motor (Main Drive)","titleCn":"电机","subsections":[]},
        {"id":"maint-2","number":"2","titleEn":"Coupling","titleCn":"联轴器","subsections":[]},
        {"id":"maint-3","number":"3","titleEn":"Main Drive","titleCn":"主驱动","subsections":[
            {"id":"maint-3-1","number":"3.1","titleEn":"Main Gear Box","titleCn":"主减速箱"},
            {"id":"maint-3-2","number":"3.2","titleEn":"Slow Drive","titleCn":"低速驱动"},
            {"id":"maint-3-3","number":"3.3","titleEn":"Girth Gear","titleCn":"大齿轮圈"},
        ]},
        {"id":"maint-4","number":"4","titleEn":"Agitator(s)","titleCn":"搅拌器","subsections":[]},
        {"id":"maint-5","number":"5","titleEn":"Bottom Vat Pump","titleCn":"底部槽体泵","subsections":[]},
        {"id":"maint-6","number":"6","titleEn":"Rope Seal Between Inlet Chute and Rotating Part","titleCn":"绳索密封","subsections":[]},
        {"id":"maint-7","number":"7","titleEn":"Alignment of the Support Rolls","titleCn":"支撑滚轮调整","subsections":[]},
        {"id":"maint-8","number":"8","titleEn":"Shower Pipe","titleCn":"喷淋水管","subsections":[]},
        {"id":"maint-9","number":"9","titleEn":"Lubrication System","titleCn":"润滑系统","subsections":[]},
        {"id":"maint-10","number":"10","titleEn":"Inside of the Drum","titleCn":"转鼓内部","subsections":[]},
        {"id":"maint-11","number":"11","titleEn":"Area of the FibreFlow Drum Pulping System","titleCn":"转鼓碎浆系统区域","subsections":[]},
        {"id":"maint-12","number":"12","titleEn":"Furnish Quality","titleCn":"废纸质量","subsections":[]},
        {"id":"maint-13","number":"13","titleEn":"Checking the Gears","titleCn":"检查减速齿轮","subsections":[
            {"id":"maint-13-1","number":"13.1","titleEn":"Measuring Thickness","titleCn":"测量厚度"},
            {"id":"maint-13-2","number":"13.2","titleEn":"Checking Backlash and Runout","titleCn":"检查齿间隙和偏转公差"},
        ]},
    ]},
    {"id":"lubrication","number":"V","titleEn":"LUBRICATION INSTRUCTIONS","titleCn":"润滑说明","sections":[
        {"id":"lube-1","number":"1","titleEn":"Lubrication Points and Schedule","titleCn":"润滑点和润滑周期","subsections":[]},
    ]},
    {"id":"supplier","number":"VI","titleEn":"SUB-SUPPLIER DOCUMENTATION","titleCn":"供应商信息","sections":[
        {"id":"supplier-1","number":"1","titleEn":"Main Drive","titleCn":"主传动","subsections":[]},
        {"id":"supplier-2","number":"2","titleEn":"Slow Drive","titleCn":"慢速驱动","subsections":[]},
        {"id":"supplier-3","number":"3","titleEn":"Gear Girth","titleCn":"大齿圈","subsections":[]},
        {"id":"supplier-4","number":"4","titleEn":"Coupling","titleCn":"联轴器","subsections":[]},
        {"id":"supplier-5","number":"5","titleEn":"Proximity Switch","titleCn":"限位开关","subsections":[]},
    ]},
]

def extract_pdf(path):
    pages = []
    with open(path, 'rb') as f:
        for page in PyPDF2.PdfReader(f).pages:
            t = page.extract_text()
            if t: pages.append(t)
    return '\n'.join(pages)

def clean(t):
    t = re.sub(r'-\n', '', t)
    t = re.sub(r'(?<!\n)\n(?!\n)', ' ', t)
    t = re.sub(r'\n{3,}', '\n\n', t)
    t = re.sub(r' {2,}', ' ', t)
    # Remove repeating headers
    t = re.sub(r'Fibre ?Flow Drum FFD[^\n]*\n', '', t)
    t = re.sub(r'Paperiko Co\.[^\n]*\n', '', t)
    t = re.sub(r'桂平市桥裕纸业[^\n]*\n', '', t)
    t = re.sub(r'\d{2}\.\d{2}\.\d{4}[^\n]*\n', '', t)
    return t.strip()

def split_en(text):
    chs = {}
    patterns = [
        (r'I\s+SAFETY\s+REGULATIONS', 'safety'),
        (r'II\s+MECHANICAL\s+START[\s-]*UP', 'mechanical-startup'),
        (r'III\s+OPERATING\s+INSTRUCTIONS', 'operating'),
        (r'IV\s+MAINTENANCE\s+INSTRUCTIONS', 'maintenance'),
        (r'V\s+Lubrication\s+Instructions', 'lubrication'),
        (r'VI\s+Sub[\s-]*supplier', 'supplier'),
    ]
    pos = []
    for p, cid in patterns:
        for m in re.finditer(p, text, re.I):
            pos.append((m.start(), cid))
    pos.sort()
    for i, (s, cid) in enumerate(pos):
        e = pos[i+1][0] if i+1 < len(pos) else len(text)
        chs[cid] = text[s:e]
    return chs

def split_cn(text):
    chs = {}
    patterns = [
        (r'第一章\s+安全规程', 'safety'),
        (r'第二章\s+设备开机说明', 'mechanical-startup'),
        (r'第三章\s+操作说明', 'operating'),
        (r'第四章\s+维护保养指南', 'maintenance'),
        (r'第五章\s+润滑说明', 'lubrication'),
        (r'第六章\s+供应商信息', 'supplier'),
    ]
    pos = []
    for p, cid in patterns:
        for m in re.finditer(p, text):
            pos.append((m.start(), cid))
    pos.sort()
    for i, (s, cid) in enumerate(pos):
        e = pos[i+1][0] if i+1 < len(pos) else len(text)
        chs[cid] = text[s:e]
    return chs

def ext_content(ch_texts, ch_id, sec_id):
    if ch_id not in ch_texts: return ""
    text = ch_texts[ch_id]
    parts = sec_id.split('-')
    sec_num = '.'.join(parts[1:]) if len(parts) >= 3 else (parts[1] if len(parts) == 2 else "")

    # Find section title from CHAPTERS
    title_en = title_cn = ""
    for ch in CHAPTERS:
        if ch["id"] == ch_id:
            for s in ch["sections"]:
                if s["id"] == sec_id: title_en, title_cn = s["titleEn"], s["titleCn"]; break
                for sub in s.get("subsections", []):
                    if sub["id"] == sec_id: title_en, title_cn = sub["titleEn"], sub["titleCn"]; break
            break

    # Find by number
    esc = re.escape(sec_num)
    m = re.search(rf'(?:^|\n)\s*{esc}[\.\)\s]+', text)
    if not m:
        m = re.search(rf'(?:^|\n)\s*{esc}\s+', text)

    if not m: return ""

    start = m.start()
    # Find next section
    nm = re.search(rf'\n\s*\d+\.\d+[\.\)\s]', text[m.end():])
    end = m.end() + nm.start() if nm else min(start + 5000, len(text))
    return clean(text[start:end])

print("Building manual...")
en_t = extract_pdf(EN)
cn_t = extract_pdf(CN)
print(f"EN: {len(en_t)} chars, CN: {len(cn_t)} chars")

en_ch = split_en(en_t)
cn_ch = split_cn(cn_t)
print(f"Chapters - EN: {list(en_ch.keys())}, CN: {list(cn_ch.keys())}")

manual = {"meta": {
    "title":"ANDRITZ FFD400EEL Fibre Flow Drum",
    "subtitleEn":"Erection Work, Operating and Maintenance Instructions",
    "subtitleCn":"安装、操作和维修说明",
    "machineModel":"FFD400EEL","manufacturingNo":"210243705",
    "yearOfManufacture":"2025","customerEn":"Paperiko Co., Ltd.",
    "customerCn":"Paperiko Co., Ltd.","orderNo":"PRF 40178405",
    "totalPages":40,"generatedAt":"2026-07-02","languages":["en","cn"],
}, "chapters":[]}

for ch in CHAPTERS:
    co = {"id":ch["id"],"number":ch["number"],"titleEn":ch["titleEn"],"titleCn":ch["titleCn"],"sections":[]}
    for sec in ch["sections"]:
        so = {"id":sec["id"],"number":sec["number"],"titleEn":sec["titleEn"],"titleCn":sec["titleCn"],
              "contentEn":ext_content(en_ch,ch["id"],sec["id"]),
              "contentCn":ext_content(cn_ch,ch["id"],sec["id"]),
              "figures":[],"subsections":[]}
        for sub in sec.get("subsections",[]):
            suo = {"id":sub["id"],"number":sub["number"],"titleEn":sub["titleEn"],"titleCn":sub["titleCn"],
                   "contentEn":ext_content(en_ch,ch["id"],sub["id"]),
                   "contentCn":ext_content(cn_ch,ch["id"],sub["id"]),
                   "figures":[]}
            so["subsections"].append(suo)
        co["sections"].append(so)
    manual["chapters"].append(co)

with open(OUT / "manual.json", 'w', encoding='utf-8') as f:
    json.dump(manual, f, ensure_ascii=False, indent=2)
print(f"✅ manual.json: { (OUT/'manual.json').stat().st_size / 1024:.0f} KB")

# Checklist
checklist = {"meta":{"title":"Mechanical & Instruments Checkout","titleCn":"机械与仪表调试检查清单","source":"Startup Guideline & Operation Instruction","totalItems":23},"items":[
    {"id":"co-01","number":1,"title":"Installation of the drum pulper visually checked","titleCn":"转鼓碎浆机安装目视检查","hasValue":False,"hasRemark":True},
    {"id":"co-02","number":2,"title":"Sealing water and cooling water pipe flushed and connected","titleCn":"密封水和冷却水管路冲洗并连接","hasValue":False,"hasRemark":True},
    {"id":"co-03","number":3,"title":"Check sealing water & cooling water flow, no plugged issue","titleCn":"检查密封水和冷却水流量，无堵塞","hasValue":False,"hasRemark":True},
    {"id":"co-04","number":4,"title":"Function of sealing water flow switch checked","titleCn":"密封水流量开关功能检查","hasValue":False,"hasRemark":True},
    {"id":"co-05","number":5,"title":"Oil level (gear box) checked","titleCn":"齿轮箱油位检查","hasValue":True,"valueUnit":"","remark":"According to nameplate","hasRemark":True},
    {"id":"co-06","number":6,"title":"Function of temperature switches (gear box) checked","titleCn":"齿轮箱温度开关功能检查","hasValue":False,"hasRemark":True},
    {"id":"co-07","number":7,"title":"Function of oil pressure switch (gear box) checked","titleCn":"齿轮箱油压开关功能检查","hasValue":False,"hasRemark":True},
    {"id":"co-08","number":8,"title":"Function of difference pressure switch (gear box) checked","titleCn":"齿轮箱差压开关功能检查","hasValue":False,"hasRemark":True},
    {"id":"co-09","number":9,"title":"Circulation oil pump rotation test, check the pressure","titleCn":"循环油泵旋转测试，检查压力","hasValue":True,"valueUnit":"bar","hasRemark":True},
    {"id":"co-10","number":10,"title":"Drum pulper position sensor signal test","titleCn":"转鼓碎浆机位置传感器信号测试","hasValue":False,"hasRemark":True},
    {"id":"co-11","number":11,"title":"Lubrication system control box I/O checked (SKF system)","titleCn":"润滑系统控制箱 I/O 检查 (SKF系统)","hasValue":False,"hasRemark":True},
    {"id":"co-12","number":12,"title":"Install Lubrication oil pump (SKF system)","titleCn":"安装润滑油泵 (SKF系统)","hasValue":False,"hasRemark":True},
    {"id":"co-13","number":13,"title":"Flushing air tube completely","titleCn":"空气管路完全冲洗","hasValue":False,"hasRemark":True},
    {"id":"co-14","number":14,"title":"Flushing Lubrication oil pipe with grease (SKF system)","titleCn":"润滑油脂管路冲洗 (SKF系统)","hasValue":False,"hasRemark":True},
    {"id":"co-15","number":15,"title":"Refill grease for all bearings","titleCn":"所有轴承补充润滑脂","hasValue":False,"hasRemark":True},
    {"id":"co-16","number":16,"title":"Check and adjust the oil spray nozzle angle (SKF system)","titleCn":"检查和调整油喷嘴角度 (SKF系统)","hasValue":False,"hasRemark":True},
    {"id":"co-17","number":17,"title":"Drum pulper main motor rotation test without coupling","titleCn":"转鼓碎浆机主电机旋转测试（未连接联轴器）","hasValue":False,"hasRemark":True},
    {"id":"co-18","number":18,"title":"Motor power transmitter check","titleCn":"电机功率变送器检查","hasValue":True,"valueUnit":"kW","hasRemark":True},
    {"id":"co-19","number":19,"title":"Slow drive control box check & brake wiring check","titleCn":"慢速驱动控制箱和制动接线检查","hasValue":False,"hasRemark":True},
    {"id":"co-20","number":20,"title":"Fill oil for fluid coupling","titleCn":"液力联轴器加油","hasValue":False,"hasRemark":True,"remark":"详见液力联轴器手册"},
    {"id":"co-21","number":21,"title":"Install back the coupling and run the main motor, at the same time run the SKF system","titleCn":"连接联轴器，运行主电机+SKF系统","hasValue":False,"hasRemark":True},
    {"id":"co-22","number":22,"title":"Vibrations, noise, temperature check","titleCn":"振动、噪音、温度检查","hasValue":False,"hasRemark":True},
    {"id":"co-23","number":23,"title":"Bottom vat agitator rotation test","titleCn":"底部槽体搅拌器旋转测试","hasValue":False,"hasRemark":True},
]}

with open(OUT / "checklist.json", 'w', encoding='utf-8') as f:
    json.dump(checklist, f, ensure_ascii=False, indent=2)
print(f"✅ checklist.json written")

# Count stats
en_c = sum(len(s.get("contentEn",""))+sum(len(b.get("contentEn","")) for b in s.get("subsections",[])) for ch in manual["chapters"] for s in ch["sections"])
cn_c = sum(len(s.get("contentCn",""))+sum(len(b.get("contentCn","")) for b in s.get("subsections",[])) for ch in manual["chapters"] for s in ch["sections"])
print(f"Total: {en_c:,} EN chars, {cn_c:,} CN chars")
