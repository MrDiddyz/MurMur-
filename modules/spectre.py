from __future__ import annotations

from typing import Any

from modules.memory import RuntimeState


def _build_senior_template() -> dict[str, object]:
    return {
        "name": "SeniorFit-Motivasjon",
        "target_group": "Eldre som ønsker trygg trening, motivasjon og bedre vekt/helse",
        "profile_fields": [
            "Alder",
            "Aktivitetsnivå i dag",
            "Eventuelle helsehensyn (blodtrykk, diabetes, leddsmerter)",
            "Målvekt / ønsket funksjon (balanse, styrke, utholdenhet)",
            "Matpreferanser og allergier",
        ],
        "weekly_training": [
            "3 x 20-30 min gåtur med progressiv økning",
            "2 x styrkeøkt med stoløvelser/kroppsvekt",
            "1 x mobilitet/balanse (hofter, ankler, kjernemuskulatur)",
            "1 hviledag med lett bevegelse",
        ],
        "daily_motivation": [
            "Morgensjekk: dagsform 1-10 + enkel oppmuntring",
            "Mikromål: ett konkret mål per dag",
            "Kveldslogg: hva gikk bra + neste forbedring",
        ],
        "nutrition_framework": [
            "Proteinkilde i hvert hovedmåltid",
            "50% grønnsaker på tallerken ved lunsj/middag",
            "Fiber + væskeplan (vann fordelt utover dagen)",
            "Energibalanse tilpasset vektmål (mildt underskudd ved vektnedgang)",
        ],
    }


def _build_video_system_template() -> dict[str, object]:
    return {
        "name": "RescueVision-HQ",
        "focus": "Superrealistiske redningshistorier med dyr og mennesker",
        "modular_architecture": [
            "Signal Collector: trend-/engasjementsdata fra egne kampanjer og åpne benchmarks",
            "Prompt Lab: versjonerte prompt-maler med scene, lys, kamera, emosjon og sikkerhet",
            "Generator Router: velger beste modell-konfig per scene (quality vs speed)",
            "Quality Gate: scorer realisme, stabilitet, anatomi, kontinuitet og policy-sikkerhet",
            "Realtime Learner: oppdaterer ranking av prompts/modeller fra watch-time og completion-rate",
            "Publish Optimizer: A/B-tester thumbnails, hooks og formater før skalering",
        ],
        "optimization_policy": [
            "Lær av offentlige mønstre og benchmark-resultater, ikke kopi av proprietær kode",
            "Hold en scorematrise per modell: kvalitet, kostnad, hastighet, feilrate",
            "Auto-reroute ved kvalitetsfall til mer robust pipeline",
        ],
        "story_template": [
            "Akt 1: Et sårbart dyr i fare + menneskelig redningskarakter",
            "Akt 2: Kritisk vending med tydelig samarbeid og empati",
            "Akt 3: Sikker redning, rolig etterspill og positiv avslutning",
        ],
    }


def run_spectre_mode(user_text: str, listener_output: dict[str, Any], state: RuntimeState) -> dict[str, Any]:
    goals = listener_output.get("goals", []) or ["Bygge en modulær videogenerator"]
    obstacles = listener_output.get("obstacles", []) or ["Konsistent fotoekte kvalitet"]

    primary_goal = goals[0]
    primary_obstacle = obstacles[0]

    spectre_phases = [
        "Scan: analyser topp 10 dyre-nisjer og hent mønstre fra høyytelsesvideoer",
        "Prompt Forge: bygg scenegrammatikk for rescue-aksjoner (dyr + mennesker)",
        "Generate: kjør flertrinns video pipeline (storyboard -> motion -> detaljforbedring)",
        "Verify: valider anatomisk realisme, fysikk, lyssetting og følelsesmessig troverdighet",
        "Refine: lær fra retention/signaler og oppdater promptmaler i sanntid",
        "Publish: ranger, A/B-test og skaler vinnende konsepter automatisk",
    ]

    next_actions = [
        f"Lås primær nisje: {state.niche}",
        f"Sett kjerneutfall for målet '{primary_goal}' med tydelige KPI-er",
        "Definer modulene: signal-collector, prompt-lab, generator-router, quality-gate, realtime-learner",
        "Lag 20 sterke prompt-oppskrifter for unike redningsscener med dyr og mennesker",
        "Bygg evalueringsscore (realisme, emosjon, seertid, deling, konvertering)",
        "Etabler benchmark-tabell mot tidligere vellykkede åpne video-workflows",
        f"Lag risikoplan mot hinderet '{primary_obstacle}' før full skalering",
    ]

    goal_text = " ".join(str(goal).lower() for goal in goals)
    include_senior_template = any(keyword in goal_text for keyword in ("eldre", "trening", "motivasjon", "kosthold", "vekt"))
    include_video_system_template = any(
        keyword in goal_text for keyword in ("video", "realisme", "app", "modellsystem", "optimalisere")
    )

    if include_senior_template:
        next_actions.extend(
            [
                "Aktiver SeniorFit-template for personlig treningspartner og motivator",
                "Tilpass ukesplan etter helseprofil, intensitet og progresjon",
                "Koble kostholdsrammeverk til vektmål og medisinske hensyn",
            ]
        )

    payload: dict[str, Any] = {
        "mode": "spectre-video",
        "summary": f"Mål: {primary_goal}. Flaskehals: {primary_obstacle}.",
        "automation_loop": spectre_phases,
        "next_actions": next_actions,
        "state_snapshot": {
            "interactions": state.interactions,
            "known_goals": state.top_goals[:5],
            "known_obstacles": state.top_obstacles[:5],
        },
        "raw_input": user_text,
    }

    if include_senior_template:
        payload["senior_template"] = _build_senior_template()
    if include_video_system_template:
        payload["video_system_template"] = _build_video_system_template()

    return payload
