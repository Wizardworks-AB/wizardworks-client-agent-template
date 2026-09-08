---
name: meeting-capture
description: Record a meeting, transcribe it, and save the notes to the Fae knowledge graph. Use when the user wants to record a meeting or call, transcribe an audio recording, or turn a meeting into notes, decisions, and action items.
---

# Meeting Capture

Turn a live meeting into transcribed notes, decisions, and action items in the Fae knowledge graph. A meeting that is not in the graph did not happen as far as the next session is concerned.

There are **two ways to capture a meeting. The user chooses — never steer them to one or the other.** Present both when they have not said which they want:

| Option | How it works | Good to know |
|--------|--------------|--------------|
| **Fae Meeting Recorder** | A bot joins the Teams meeting as a visible participant. Recording, transcription, and summary delivery happen server-side; participants get a consent card in the meeting. | Teams meetings only. Invited via the Fae portal's Meetings page. |
| **Local recording** | The `audio-recorder` tool records on the user's machine: all system audio (the other participants) and the microphone (the user) as synced tracks, mixed into one transcription-ready file. | Works for any meeting form — Teams, Meet, Zoom, phone, or a physical room. |

If the user chose the Fae Meeting Recorder, your job starts when the transcript or summary arrives: go to **Meeting notes** and **Save to the graph** below.

## Local recording

### Get the tool (first time)

The tool lives in the private Wizardworks repo — requires Wizardworks GitHub access:

```bash
gh repo clone Wizardworks-AB/audio-recorder
```

Build it per the repo's README (macOS: a Swift CLI + `record.sh`; Windows: a .NET CLI + `record.ps1`). The README also documents one-time OS permissions — on macOS, missing system-audio permission produces *silent files with no error*, so the volume check below is not optional.

### Record

```bash
# macOS                                   # Windows
./record.sh start <name> [output-dir]     .\record.ps1 start <name> [output-dir]
./record.sh status                         .\record.ps1 status
./record.sh stop                           .\record.ps1 stop
```

`stop` mixes both tracks into `<name>.m4a`, ready for transcription. Keep the raw track files until the transcription is verified.

**Verify the audio is being captured**: run `status` about 30 seconds in and check the mean volume (below −80 dB means it is capturing nothing — fix the setup instead of hoping). For long meetings, check again periodically. A recording that fails silently is worse than no recording, because everyone relied on it.

One line worth knowing: the audio is sent to ElevenLabs for transcription — follow your organization's practice for informing meeting participants.

## Transcribe

Transcription uses ElevenLabs Speech-to-Text. The API key comes from the `ELEVENLABS_API_KEY` environment variable; if it is not set, ask the user where their key is kept (then record that location in the graph as a `preference` so the next session knows).

Files up to 1 GB can be sent as-is. Larger files: compress first with `ffmpeg -i in.wav -ac 1 -b:a 64k out.m4a`.

```bash
curl -s -X POST "https://api.elevenlabs.io/v1/speech-to-text" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -F "file=@<recording>.m4a" \
  -F "model_id=scribe_v1" \
  -F "diarize=true" \
  -o transcription.json
```

The response contains the full text plus word-level segments with speaker labels. Diarization labels speakers acoustically (`speaker_0`, `speaker_1`, …) — map them to names from context (who opened the meeting, who was addressed by name) and say so when a mapping is a guess.

Then produce a readable transcript, `<name>.transcript.md`: one paragraph per speaker turn, prefixed with `[mm:ss] <speaker>`, using the mapped names (keep `speaker_n` where the mapping is a guess). Generate it from the JSON with a small script — never retype the transcript by hand; a one-hour meeting is thousands of words. Keep `transcription.json` as well; it is the source of the readable version.

## Meeting notes

Write the notes from the transcript, structured as:

- **Attendees** and date
- **Agenda / topics discussed** — what was actually said, not embellished
- **Decisions** — only what was explicitly decided; undecided is undecided
- **Action items** — with owner and deadline where stated
- **Open questions**

Stick to the transcript. Do not upgrade a suggestion into a decision or a musing into an action item.

## Save to the graph

This is the step that makes the meeting exist beyond this session. Per `rules/fae.md`:

1. `remember("fact", "Meeting — <topic> (<date>)", <the full notes — not a file reference>)`. The result ends with `(id: <nodeId>)` — that is the **meeting node**; keep the id for the next step.
2. **Attach the full transcript to the meeting node.** The notes are a summary; the transcript is the source, and it must be reachable from the graph, not only from the user's disk. Per the *File Attachments* section of `rules/fae.md`, never paste transcript content into a tool call — request an upload URL and stream the file from the shell:
   1. `request_attachment_upload(<meetingNodeId>, "<topic>-<date>.transcript.md", "text/markdown", "Full transcript")`, then run the returned curl command with `<name>.transcript.md` as the file.
   2. `request_attachment_upload(<meetingNodeId>, "<topic>-<date>.transcription.json", "application/json", "Raw transcription (ElevenLabs, diarized)")`, then run the returned curl command with `transcription.json` as the file.

   Each URL is single-use and expires after 15 minutes — if a curl fails, request a new URL for that file and retry; do not report the meeting as saved while either upload is missing. If the Fae Meeting Recorder delivered the transcript, attach that file the same way (one upload, whatever format it arrived in).
3. For every concrete decision made in the meeting: `decide(decision, rationale, relatedTo: [<meetingNodeId>])` — one call per decision.
4. New people, companies, or systems that came up: `remember("entity", ...)`.

Then deliver the notes to the user in whatever form they asked for (file, message, summary), and tell them the transcript is attached to the meeting node. Only after both uploads succeeded may the local audio and transcript files be deleted, if the user wants them gone.
