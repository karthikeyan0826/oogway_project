import re
from typing import List, Dict, Any

class TranscriptChunk:
    def __init__(
        self,
        chunk_id: str,
        guest: str,
        episode_title: str,
        section: str,
        text: str,
        chunk_index: int,
    ):
        self.chunk_id = chunk_id
        self.guest = guest
        self.episode_title = episode_title
        self.section = section
        self.text = text
        self.chunk_index = chunk_index

    def to_dict(self) -> Dict[str, Any]:
        return {
            "chunk_id": self.chunk_id,
            "guest": self.guest,
            "episode_title": self.episode_title,
            "section": self.section,
            "text": self.text,
            "chunk_index": self.chunk_index,
        }

class RecursiveSemanticChunker:
    """
    Splits long podcast transcripts into semantic, metadata-aware chunks
    preserving section titles, speaker turns, and coherent thoughts.
    """
    def __init__(self, target_chunk_size: int = 900, overlap_size: int = 150):
        self.target_chunk_size = target_chunk_size
        self.overlap_size = overlap_size

    def parse_header_metadata(self, text: str) -> Dict[str, str]:
        guest = "Lenny Rachitsky Guest"
        episode_title = "Lenny's Podcast"
        
        guest_match = re.search(r"##\s*Guest:\s*(.+)", text, re.IGNORECASE)
        if guest_match:
            guest = guest_match.group(1).strip()
            
        title_match = re.search(r"##\s*Episode Title:\s*(.+)", text, re.IGNORECASE)
        if title_match:
            episode_title = title_match.group(1).strip()
            
        return {"guest": guest, "episode_title": episode_title}

    def chunk_transcript(self, raw_text: str, doc_id_prefix: str = "doc") -> List[TranscriptChunk]:
        metadata = self.parse_header_metadata(raw_text)
        guest = metadata["guest"]
        episode_title = metadata["episode_title"]

        # Split content into major sections by "### [...] Section:"
        section_pattern = re.compile(r"(###\s*\[\d{2}:\d{2}:\d{2}\]\s*Section:[^\n]+)")
        raw_sections = section_pattern.split(raw_text)

        chunks: List[TranscriptChunk] = []
        current_section = "General Overview"
        chunk_counter = 0

        i = 0
        while i < len(raw_sections):
            part = raw_sections[i].strip()
            if not part:
                i += 1
                continue

            if section_pattern.match(part):
                current_section = part.replace("###", "").strip()
                i += 1
                if i < len(raw_sections):
                    section_content = raw_sections[i].strip()
                    i += 1
                else:
                    section_content = ""
            else:
                section_content = part
                i += 1

            if not section_content:
                continue

            # Sub-chunk the section content semantically by paragraphs
            paragraphs = [p.strip() for p in section_content.split("\n\n") if p.strip()]
            current_buffer = ""

            for para in paragraphs:
                if len(current_buffer) + len(para) <= self.target_chunk_size:
                    current_buffer += ("\n\n" if current_buffer else "") + para
                else:
                    if current_buffer:
                        chunk_id = f"{doc_id_prefix}_{chunk_counter}"
                        chunks.append(TranscriptChunk(
                            chunk_id=chunk_id,
                            guest=guest,
                            episode_title=episode_title,
                            section=current_section,
                            text=current_buffer,
                            chunk_index=chunk_counter
                        ))
                        chunk_counter += 1
                        
                        # Preserve overlap from tail of buffer
                        overlap_start = max(0, len(current_buffer) - self.overlap_size)
                        current_buffer = current_buffer[overlap_start:] + "\n\n" + para
                    else:
                        current_buffer = para

            if current_buffer:
                chunk_id = f"{doc_id_prefix}_{chunk_counter}"
                chunks.append(TranscriptChunk(
                    chunk_id=chunk_id,
                    guest=guest,
                    episode_title=episode_title,
                    section=current_section,
                    text=current_buffer,
                    chunk_index=chunk_counter
                ))
                chunk_counter += 1

        return chunks
