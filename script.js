// Animated road and opposing scroll-driven light trails.
const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");
const drive = document.querySelector(".drive");
let W = 0, H = 0, DPR = 1, progress = 0, raf = 0;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth || innerWidth;
    H = canvas.clientHeight || innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    draw();
}
function path(t) {
    return {
        x: W * (.53 + .14 * Math.sin(t * 3) + .055 * Math.sin(t * 8.5)),
        y: H * (.94 - .60 * t)
    };
}
function roadWidth(t) { return W * (.50 * Math.pow(1 - t, 1.35) + .014); }
function line(points, color, width, blur = 0) {
    ctx.beginPath();
    points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.stroke();
    ctx.shadowBlur = 0;
}
function sky() {
    const g = ctx.createLinearGradient(0, 0, 0, H * .75);
    g.addColorStop(0, "#030916");
    g.addColorStop(.58, "#14233c");
    g.addColorStop(1, "#8c4255");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fcb19b";
    ctx.globalAlpha = .1;
    ctx.fillRect(0, H * .33, W, H * .1);
    ctx.globalAlpha = 1;
}
function mountains() {
    ctx.fillStyle = "#091525";
    ctx.beginPath();
    ctx.moveTo(0, H * .44);
    for (let x = 0; x <= W + 20; x += 25) {
        ctx.lineTo(x, H * (.44 + .045 * Math.sin(x / W * 12) + .07 * Math.sin(x / W * 4 + 1)));
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.fill();
    ctx.fillStyle = "#0b1b2b";
    ctx.beginPath();
    ctx.moveTo(0, H * .53);
    for (let x = 0; x <= W + 20; x += 20) {
        ctx.lineTo(x, H * (.55 + .05 * Math.sin(x / W * 10 + 2)));
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.fill();
}
function forest() {
    let seed = 27;
    function rand() {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
    }
    for (let i = 0; i < 160; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const t = rand(), p = path(t), w = roadWidth(t);
        const x = p.x + side * (w * .65 + rand() * W * .20);
        const y = p.y + (rand() - .5) * H * .09;
        const size = lerp(5, 75, 1 - t) * (.5 + rand());
        ctx.fillStyle = i % 3 ? "#081623" : "#1b2d3e";
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x - size * .33, y + size * .12);
        ctx.lineTo(x + size * .33, y + size * .12);
        ctx.fill();
        ctx.fillStyle = "#b2c2d0";
        ctx.globalAlpha = .22;
        ctx.fillRect(x - size * .16, y - size * .17, size * .25, 2);
        ctx.globalAlpha = 1;
    }
}
function roadway() {
    const left = [], right = [], middle = [];
    for (let i = 0; i <= 110; i++) {
        const t = i / 110, p = path(t), w = roadWidth(t);
        left.push({ x: p.x - w * .53, y: p.y });
        right.push({ x: p.x + w * .53, y: p.y });
        middle.push(p);
    }
    ctx.beginPath();
    left.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    right.slice().reverse().forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    const g = ctx.createLinearGradient(0, H * .4, 0, H);
    g.addColorStop(0, "#17202c");
    g.addColorStop(1, "#0a101a");
    ctx.fillStyle = g;
    ctx.fill();
    line(left, "#c2ced8", 3);
    line(right, "#b8c6d4", 3);
    ctx.setLineDash([22, 25]);
    line(middle, "#bb9154", 2);
    ctx.setLineDash([]);
}
function drawStream(fromT, toT, side, colors) {
    if (Math.abs(toT - fromT) < .003) return;
    for (let rail = 0; rail < 2; rail++) {
        const points = [];
        for (let i = 0; i <= 170; i++) {
            const t = lerp(fromT, toT, i / 170);
            const p = path(t), w = roadWidth(t);
            const lateral = (side === 1 ? .21 : -.21) + (rail === 0 ? -.027 : .027);
            points.push({ x: p.x + w * lateral, y: p.y });
        }
        line(points, colors.glow, Math.max(3, W * .006), 24);
        line(points, colors.main, Math.max(2, W * .003), 12);
        line(points, colors.core, Math.max(1, W * .0011), 3);
    }
}
function trails() {
    const amount = clamp((progress - .015) / .92);
    if (amount <= 0) return;
    const ease = amount * amount * (3 - 2 * amount);
    drawStream(.025, lerp(.025, .975, ease), 1, {
        glow: "#ff003b44", main: "#ff194c", core: "#ffd1dc"
    });
    drawStream(.975, lerp(.975, .025, ease), -1, {
        glow: "#b7e9ff55", main: "#e1f6ff", core: "#ffffff"
    });
}
function draw() {
    if (!W || !H) return;
    ctx.clearRect(0, 0, W, H);
    sky(); mountains(); forest(); roadway(); trails();
    const vignette = ctx.createRadialGradient(W * .5, H * .5, H * .12, W * .5, H * .5, W * .85);
    vignette.addColorStop(0, "#00000000");
    vignette.addColorStop(1, "#000000b8");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);
}
function scroll() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
        raf = 0;
        const length = drive.offsetHeight - innerHeight;
        progress = clamp(-drive.getBoundingClientRect().top / Math.max(1, length));
        draw();
    });
}
window.addEventListener("scroll", scroll, { passive: true });
window.addEventListener("resize", () => { resize(); scroll(); });
document.getElementById("year").textContent = new Date().getFullYear();
document.querySelectorAll("[data-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll("[data-filter]").forEach(b => {
            b.classList.toggle("selected", b === btn);
        });
        document.querySelectorAll(".cards article").forEach(card => {
            card.hidden = btn.dataset.filter !== "all" &&
                !card.dataset.tags.split(" ").includes(btn.dataset.filter);
        });
    });
});
resize();
scroll();

/* =========================================
   PROJECT POP-UP CONTENT
   ========================================= */

const projectData = {
    thermal: {
        category: "01 / EMBEDDED SYSTEMS",
        title: "Thermal Occupancy Detection",
        intro: "ESP32-based doorway occupancy monitoring system.",

        overview:
            "Development of a doorway monitoring system that " +
            "counts people entering and exiting a room using " +
            "thermal sensor data and an ESP32 microcontroller. " +
            "The project involves sensor selection, hardware " +
            "integration, testing, and system reliability.",

        details: [
            "ESP32 microcontroller integration",
            "Thermal array sensor evaluation",
            "I²C communication and sensor data processing",
            "PCB design and hardware integration",
            "Testing of multiple-person detection",
            "Evaluation of counting accuracy and limitations"
        ],

        tags: [
            "ESP32",
            "Embedded C++",
            "I²C",
            "PCB Design",
            "Thermal Imaging"
        ]
    },

    solar: {
        category: "02 / OPTOELECTRONICS",
        title: "Kesterite Solar Cell Research",
        intro: "Research proposal investigating quantum-engineered kesterite solar cells.",

        overview:
            "Proposed investigating quantum dots and quantum wells in kesterite-based " +
            "photovoltaic devices to improve energy conversion efficiency. " +
            "The research examines opportunities to address open-circuit voltage " +
            "deficits, carrier recombination, and material stability.",

        details: [
            "Proposed integration of quantum dots and quantum wells",
            "Kesterite semiconductor materials and photovoltaic device physics",
            "Open-circuit voltage deficits and recombination losses",
            "Potential efficiency improvements through quantum engineering",
            "Research proposal; performance improvements not yet experimentally demonstrated"
        ],

        tags: [
            "Semiconductors",
            "Photovoltaics",
            "Quantum Dots",
            "Quantum Wells",
            "Optoelectronics"
        ],
        website: "https://docs.google.com/document/d/1vdd4ynXJqURbMEd8OPiyy8fb02sUrtF-/edit?usp=sharing&ouid=111964794422243907180&rtpof=true&sd=true",
        websiteLabel: "VIEW KESTERITE RESEARCH PROPOSAL ↗"
    },

    glove: {
        category: "03 / OPTICAL ENGINEERING",
        title: "Optical Fiber Data Glove",
        intro: "Wearable sensing concept using optical fibers.",

        overview:
            "Design concept for a wearable glove that uses " +
            "optical fibers to measure finger movement. " +
            "Changes in transmitted light could be detected " +
            "and interpreted to estimate finger bending.",

        details: [
            "Optical fiber sensing",
            "LED illumination and light distribution",
            "Photodiode-based detection",
            "Signal acquisition considerations",
            "Wearable sensor integration"
        ],

        tags: [
            "Optical Fibers",
            "Photodiodes",
            "LEDs",
            "Sensors",
            "Wearable Technology"
        ]
    },

    headlight: {
        category: "04 / AUTOMOTIVE OPTICS",
        title: "Adaptive Headlight System",
        intro: "Zemax modeling concept inspired by the Toyota Supra’s six headlight beams.",

        overview:
            "Optical design concept to recreate the Toyota Supra’s " +
            "headlight arrangement in Zemax, with three projected " +
            "beams from each side. The proposed model would provide " +
            "a starting point for evaluating beam direction, " +
            "overlap, and adaptive illumination ideas.",

        details: [
            "Three beams per headlight assembly (six total)",
            "Zemax optical system layout and ray tracing",
            "Beam projection and overlap considerations",
            "Potential extension to adaptive illumination",
            "Concept / proposed model; no simulated results presented"
        ],

        tags: [
            "Automotive",
            "Optics",
            "Adaptive Lighting",
            "Zemax",
            "Ray Tracing",
            "Optical Design"
        ]
    },

    compression: {
        category: "05 / SIGNAL PROCESSING",
        title: "Image Compression",
        intro: "Designed and evaluated a custom lossy image compression codec for 16-bit images.",
        overview: "Developed a JPEG-inspired compression pipeline combining DCT-based spatial decorrelation, SVD/PCA-based color decorrelation, quantization, DPCM, and entropy coding. Benchmarked three codec variants against rate-matched JPEG using 14 test images and measured the tradeoff between file size and reconstructed image quality.",
        details: [
            "Applied 8×8 Discrete Cosine Transform (DCT) processing and SVD/PCA-based color decorrelation",
            "Used quantization and differential pulse-code modulation (DPCM) to reduce redundant image data",
            "Explored Huffman and Asymmetric Numeral Systems (ANS) entropy encoding in multiple codec variants",
            "Achieved an average compression ratio of approximately 100:1 with the hybrid Huffman codec across 14 test images",
            "Compared reconstructed image fidelity against size-matched JPEG using PSNR and SSIM; identified opportunities to improve encoding efficiency"
        ],
        tags: ["Signal Processing", "DCT", "SVD / PCA", "DPCM", "Huffman", "ANS", "PSNR", "SSIM"],
        website: "https://tdvalencia.github.io/image-compression/index.html"
    },

    cloaking: {
        category: "06 / OPTICS",
        title: "Optical Cloaking",
        intro: "EECS 334 project exploring light redirection and concealment.",
        overview: "Optics project focused on the principles of optical cloaking: manipulating the paths of light rays so an object may be concealed from an observer.",
        details: [
            "Geometrical optics and ray propagation",
            "Light redirection and optical path design",
            "Conceptual evaluation of the cloaking arrangement",
            "Relationship between observer viewpoint and apparent visibility"
        ],
        tags: ["EECS 334", "Geometrical Optics", "Ray Tracing", "Optical Cloaking"],
        website: "https://www.youtube.com/watch?v=VUiCAupWPpk",
        websiteLabel: "WATCH OPTICAL CLOAKING VIDEO ↗"
    },

    simon: {
        category: "07 / EMBEDDED SYSTEMS",
        title: "Arduino Simon Says",
        intro: "Microcontroller-based interactive sequence memory game.",
        overview: "Arduino Simon Says project centered on generating light sequences, accepting player responses, and checking input against the programmed sequence.",
        details: [
            "Arduino microcontroller programming",
            "LED output and user input",
            "Sequence generation and comparison logic",
            "Game progression and feedback"
        ],
        tags: ["Arduino", "Embedded Programming", "LEDs", "Digital I/O"]
    },

    discs: {
        category: "08 / PHYSICS RESEARCH",
        title: "Disc Profile Physics Research",
        intro: "High school research examining discs with varying profiles.",
        overview: "Awarded first place at a high school physics science fair for research investigating how changes in a disc's physical profile influence its behavior through experimental comparison.",
        details: [
            "Comparison of differently profiled discs",
            "Experimental design and controlled observations",
            "Collection and interpretation of physics measurements",
            "Analysis of geometry-related differences",
            "First-place award at the high school physics science fair"
        ],
        tags: ["Physics", "Experimental Research", "Data Analysis", "Disc Geometry"],
        website: "https://docs.google.com/document/d/1NFepa0XR-WLPNki9HPz51zXh6u1ldYvGm65Jo57Js-Q/edit?usp=sharing",
        websiteLabel: "VIEW PHYSICS RESEARCH DOCUMENT ↗"
    }
};

/* =========================================
   OPEN AND CLOSE MODAL
   ========================================= */

const projectModal = document.getElementById("projectModal");
const closeModalButton = document.getElementById("closeModal");

function openProject(projectId) {
    const project = projectData[projectId];

    if (!project) return;

    document.getElementById("modalCategory").textContent =
        project.category;

    document.getElementById("modalTitle").textContent =
        project.title;

    document.getElementById("modalIntro").textContent =
        project.intro;

    document.getElementById("modalOverview").textContent =
        project.overview;

    const detailsList = document.getElementById("modalDetails");
    detailsList.replaceChildren();

    project.details.forEach(detail => {
        const item = document.createElement("li");
        item.textContent = detail;
        detailsList.appendChild(item);
    });

    const tagsContainer = document.getElementById("modalTags");
    tagsContainer.replaceChildren();

    project.tags.forEach(tag => {
        const element = document.createElement("span");
        element.textContent = tag;
        tagsContainer.appendChild(element);
    });

    const projectLinkWrap = document.getElementById("modalProjectLinkWrap");
    const projectLink = document.getElementById("modalProjectLink");
    projectLinkWrap.style.display = project.website ? "block" : "none";
    if (project.website) {
        projectLink.href = project.website;
        projectLink.textContent = project.websiteLabel || "VIEW PROJECT WEBSITE ↗";
    }

    projectModal.showModal();
}

/* Open a project when clicked */
document.querySelectorAll("[data-project]").forEach(card => {
    card.addEventListener("click", () => {
        openProject(card.dataset.project);
    });

    /* Keyboard accessibility */
    card.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openProject(card.dataset.project);
        }
    });
});

/* Close using X button */
closeModalButton.addEventListener("click", () => {
    projectModal.close();
});

/* Close by clicking outside the pop-up */
projectModal.addEventListener("click", event => {
    if (event.target === projectModal) {
        projectModal.close();
    }
});

/* =========================================
   EXPERIENCE POP-UP CONTENT
   ========================================= */

const experienceData = {
    realestate: {
        dates: "2020 — PRESENT",
        title: "Real Estate Agent",
        company: "Professional Real Estate of Michigan",
        overview: "Assist clients throughout real estate transactions, from evaluating market conditions to coordinating negotiations and documentation.",
        details: [
            "Analyze property information and local market conditions.",
            "Communicate with clients and coordinate transaction milestones.",
            "Support negotiations, paperwork, and closing preparation."
        ]
    },
    tax: {
        dates: "2018 — PRESENT",
        title: "Tax Preparer",
        company: "Tax Matters & Practitioner, LC",
        overview: "Prepare individual federal and state tax returns, review financial information, and help clients navigate tax filing requirements.",
        details: [
            "Review and organize client financial documents.",
            "Prepare federal and state income tax returns.",
            "Apply tax rules and maintain accurate, confidential records."
        ]
    },
    mortgage: {
        dates: "2022 — PRESENT",
        title: "Mortgage Loan Originator",
        company: "Superb Mortgage",
        overview: "Work with borrowers to assess financing needs, evaluate mortgage options, and coordinate loan documentation.",
        details: [
            "Review borrower financial and credit information.",
            "Explain mortgage options and application requirements.",
            "Coordinate documentation and support lending compliance."
        ]
    }
};

const experienceModal = document.getElementById("experienceModal");
const closeExperienceModal = document.getElementById("closeExperienceModal");

function openExperience(experienceId) {
    const entry = experienceData[experienceId];
    if (!entry || !experienceModal) return;

    document.getElementById("experienceModalDates").textContent = entry.dates;
    document.getElementById("experienceModalTitle").textContent = entry.title;
    document.getElementById("experienceModalCompany").textContent = entry.company;
    document.getElementById("experienceModalOverview").textContent = entry.overview;

    const list = document.getElementById("experienceModalDetails");
    list.replaceChildren();
    entry.details.forEach(detail => {
        const item = document.createElement("li");
        item.textContent = detail;
        list.appendChild(item);
    });

    experienceModal.showModal();
}

document.querySelectorAll("[data-experience]").forEach(card => {
    card.addEventListener("click", () => openExperience(card.dataset.experience));
    card.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openExperience(card.dataset.experience);
        }
    });
});

closeExperienceModal.addEventListener("click", () => experienceModal.close());
experienceModal.addEventListener("click", event => {
    if (event.target === experienceModal) experienceModal.close();
});
