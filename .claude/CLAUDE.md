# FMSMonorepo 프로젝트 설정

## 학습된 패턴

### [2026-02-03] Windows MCP 서버 설정

- ❌ 실패: `~/.claude/mcp.json` 파일 직접 생성 - Claude Code가 이 파일 무시함
- ❌ 실패: `claude mcp add ... -- cmd /c npx ...` - Windows에서 `/c`가 `C:/`로 자동 변환되는 버그
- ❌ 실패: `npx.cmd` 사용 - 여전히 서버 로드 안 됨
- ✅ 성공: `~/.claude.json` 파일의 `mcpServers` 필드에 직접 JSON 추가

```json
// ~/.claude.json 파일 맨 아래 mcpServers 필드에 추가
"mcpServers": {
  "playwright": {
    "command": "cmd",
    "args": ["/c", "npx", "-y", "@playwright/mcp@latest"]
  }
}
```

- 📝 교훈:
  1. Windows에서 MCP 서버는 `~/.claude.json`의 `mcpServers` 필드에 설정
  2. `~/.claude/mcp.json`은 무시됨 (잘못된 위치)
  3. `claude mcp add` 명령어가 Windows에서 `/c` 플래그를 잘못 파싱하므로 직접 JSON 편집 필요
  4. 설정 확인: `claude mcp list`
