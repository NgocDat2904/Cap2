from pydantic import BaseModel
from typing import List, Optional

class InstructorProfileUpdate(BaseModel):
    headline: Optional[str]
    bio: Optional[str]
    linkedin_url: Optional[str]
    github_url: Optional[str]
    website_url: Optional[str]
    specializations: Optional[List[str]]