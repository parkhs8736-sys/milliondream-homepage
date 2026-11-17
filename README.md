# 밀리언드림 홈페이지

구축아파트 단타매매로 현금흐름을 만들어가는 밀리언드림과 강사 밀쌤의 이야기를 소개하는 모바일 대응 정적 사이트입니다.

## 페이지와 파일

- `index.html`: 브랜드 홈, `story/posts.json` 기반 최신 글 3개, 외부 채널 안내
- `about.html`: 대표 소개, 브랜드 스토리와 타임라인
- `contact.html`: 이메일·Threads·스토어 연락처
- `story/index.html`: 글 목록
- `story/post.html`: 글 상세 화면
- `story/posts.json`: 글 데이터. 새 글은 여기에 추가하면 홈 최신 글 카드에도 자동으로 반영됩니다.
- `story/admin.html`: 제공된 글 관리 화면
- `styles.css`, `story.css`: 공통 브랜드 및 블로그 스타일
- `script.js`: 모바일 메뉴, 홈 최신 글 표시, 현재 연도
- `assets/`: 강사 사진·수강생 사진·로고 이미지

빌드 도구 없이 저장소 최상위 `index.html`을 GitHub Pages로 배포합니다. 글 상세 화면은 `posts.json`의 `id`를 읽어 `story/post.html?id=<id>`로 표시합니다. 목록과 홈은 날짜 내림차순으로 최신 글을 표시합니다.

## 공개 전 확인할 항목

- 네이버 블로그·카페·Threads 링크와 운영 정보
- 강의 일정·신청 방법 및 문의 채널
- 새 글은 실제 자료와 사실관계를 확인한 뒤 게시

현재 게시글 관리 화면(`story/admin.html`)은 원본 그대로 보존했습니다. 문의 채널은 제공된 블로그·카페·Threads로 연결합니다. 사이트는 투자 수익을 보장하는 표현을 사용하지 않습니다.
