# 🧙‍♂️ อัศวินเวทมนตร์พิทักษ์ปราสาท (Pixel Wizard Defense)

[![Play Live on Vercel](https://img.shields.io/badge/🎮_PLAY_LIVE_DEMO-Vercel_App-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://pixel-wizard-defense.vercel.app)
![2D Pixel Art](https://img.shields.io/badge/Style-2D_Pixel_Art_Fantasy-7c8cff?style=for-the-badge)
![Single AI Prompt](https://img.shields.io/badge/Built_With-Single_AI_Prompt-ffd166?style=for-the-badge&labelColor=1a2147)
![IT Showcase](https://img.shields.io/badge/Purpose-IT_Major_Guidance_Demo-4ade80?style=for-the-badge&labelColor=1a2147)
![Zero Dependencies](https://img.shields.io/badge/Tech-HTML5_Canvas_%2B_Vanilla_JS-5ef2ff?style=for-the-badge&labelColor=1a2147)

🔗 **ลิงก์เข้าเล่นเกมทันที (Vercel):** [https://pixel-wizard-defense.vercel.app](https://pixel-wizard-defense.vercel.app)

> **✨ โปรเจกต์ตัวอย่างสำหรับแนะแนวสาขาเทคโนโลยีสารสนเทศ (IT Showcase)**  
> เกมเว็บ Interactive นี้ **สร้างขึ้นด้วยการสั่งงาน Generative AI เพียง Prompt เดียวเสร็จสมบูรณ์ (Single-Prompt AI Generation)** เพื่อใช้เป็นสื่อสาธิตและแนะแนวน้องๆ นักเรียนที่กำลังก้าวเข้าสู่รั้วโรงเรียน ให้เห็นภาพว่าความรู้ด้าน **IT และการเขียนโปรแกรม** เมื่อผสานกับเครื่องมือ **AI ยุคใหม่** สามารถเปลี่ยนไอเดียให้กลายเป็นซอฟต์แวร์และเกมที่เล่นได้จริงทั้งบนคอมพิวเตอร์และมือถือภายในไม่กี่นาที

---

## 🎮 ทดลองเล่นออนไลน์ (Live Demo)

สามารถเปิดเล่นได้ทันทีทั้งบนคอมพิวเตอร์และมือถือ:
- **Vercel Live Demo:** https://pixel-wizard-defense.vercel.app
- **GitHub Pages (สำรองเมื่อเปิดใช้งาน):** `https://sanior09.github.io/pixel-wizard-defense/`
- หรือดาวน์โหลดโปรเจกต์แล้วดับเบิลคลิกเปิดไฟล์ `index.html` ในเบราว์เซอร์ได้ทันที (ไม่ต้องติดตั้ง Library เพิ่ม)

---

## 📖 กติกาและระบบเกม

ผู้เล่นรับบทเป็น **พ่อมดผู้พิทักษ์บนกำแพงปราสาทเวทมนตร์ยามค่ำคืน** มีเวลา **60 วินาที** ในการยิงลูกบอลเวทมนตร์ปกป้องปราสาท:

| เป้าหมาย | ประเภท | คะแนน |
| :--- | :--- | :---: |
| 🟢 **สไลม์ (Slime)** | มอนสเตอร์ | **+10** |
| 🟣 **ค้างคาว (Bat)** | มอนสเตอร์ | **+10** |
| 👻 **ผี (Ghost)** | มอนสเตอร์ | **+10** |
| 🐉 **มังกรน้อย (Baby Dragon)** | มอนสเตอร์ | **+10** |
| 🧚 **นางฟ้า (Fairy)** | ฝ่ายมิตร *(ห้ามยิง!)* | **-10** |
| 🐱 **สัตว์เลี้ยงเวทมนตร์ (Magical Pet)** | ฝ่ายมิตร *(ห้ามยิง!)* | **-10** |

### 🕹️ วิธีควบคุม
- **คอมพิวเตอร์ (Desktop):** เลื่อนเมาส์และคลิกเพื่อเล็งยิงลูกบอลเวทมนตร์ หรือใช้ปุ่ม `A` / `D` / ลูกศรซ้าย-ขวา ร่วมกับ `Spacebar`
- **มือถือ / แท็บเล็ต (Mobile):** แตะตำแหน่งบนฉากเพื่อยิงได้ทันที หรือใช้แถบปุ่มควบคุม `◀` `▶` และ `✨ ยิง` ด้านล่าง

---

## 🛠️ เบื้องหลังโครงสร้างโค้ด (สำหรับน้องๆ สาย IT)

โปรเจกต์นี้เขียนด้วย **Vanilla Web Technologies 100%** ไม่พึ่งพา Game Engine หรือไฟล์ภาพ/เสียงภายนอก เหมาะสำหรับใช้ศึกษาโครงสร้างพื้นฐานของการพัฒนาซอฟต์แวร์:

```text
pixel-wizard-defense/
├── index.html   # โครงสร้างหน้าเว็บ, HUD คะแนน/เวลา และหน้าจอเริ่ม/จบเกม
├── style.css    # การจัดวาง UI แบบ Responsive ทั้งคอมพิวเตอร์และมือถือ
├── sprites.js   # การวาดตัวละคร 2D Pixel Art ด้วย Pixel Matrix บน Canvas
├── audio.js     # การสังเคราะห์เสียงเอฟเฟกต์ 8-bit แบบเรียลไทม์ด้วย Web Audio API
└── game.js      # Game Loop, ระบบฟิสิกส์การเคลื่อนที่, การชน (Collision) และตัวจับเวลา
```

---

## 💡 แรงบันดาลใจสู่น้องๆ ที่สนใจเรียนสาขา IT

1. **Coding + AI = Superpower:** การเข้าใจพื้นฐาน HTML, CSS, JavaScript และตรรกะการเขียนโปรแกรม ช่วยให้เราออกแบบ ตรวจสอบ และต่อยอดผลงานที่ AI สร้างขึ้นได้อย่างมืออาชีพ
2. **จากไอเดียสู่ผลงานจริง:** ไม่ว่าจะเป็นเกม เว็บแอปพลิเคชัน หรือระบบอัตโนมัติ ทุกอย่างเริ่มต้นจากคำสั่งและการออกแบบระบบที่ชัดเจน
3. **ยินดีต้อนรับสู่สาย IT:** มาสร้างสรรค์สิ่งประดิษฐ์ดิจิทัลสนุกๆ แบบนี้ด้วยตัวเองในสาขาเทคโนโลยีสารสนเทศกันนะครับ!
