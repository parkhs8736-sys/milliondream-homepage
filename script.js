const menuButton = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('#site-nav');

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.querySelector('.sr-only').textContent = isOpen ? '메뉴 열기' : '메뉴 닫기';
  siteNav.classList.toggle('is-open', !isOpen);
});

siteNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.querySelector('.sr-only')?.replaceChildren('메뉴 열기');
    siteNav.classList.remove('is-open');
  });
});

document.querySelector('#contact-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const note = document.querySelector('#form-note');
  note.textContent = '문의 양식은 화면 시안입니다. 실제 메시지를 받으려면 이메일이나 폼 서비스를 연결해야 합니다.';
  note.classList.add('is-active');
});

document.querySelector('#year').textContent = new Date().getFullYear();

const latestStories = document.querySelector('#latest-stories');

if (latestStories) {
  const formatDate = (value) => {
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value || '';
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric',
    }).format(date);
  };

  fetch('story/posts.json', { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error(`게시글을 불러오지 못했습니다 (${response.status})`);
      return response.json();
    })
    .then((posts) => {
      if (!Array.isArray(posts)) throw new Error('게시글 목록 형식이 올바르지 않습니다.');
      const newest = posts
        .slice()
        .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
        .slice(0, 3);

      latestStories.replaceChildren();
      if (!newest.length) {
        latestStories.textContent = '아직 등록된 이야기가 없습니다.';
        return;
      }

      newest.forEach((post) => {
        const card = document.createElement('article');
        card.className = 'story-card latest-story-card';
        const link = document.createElement('a');
        link.className = 'latest-story-link';
        const staticPost = typeof post.url === 'string' && /^[\w가-힣-]+\.html$/i.test(post.url);
        link.href = staticPost ? `story/${post.url}` : `story/post.html?id=${encodeURIComponent(post.id || '')}`;
        const time = document.createElement('time');
        time.dateTime = String(post.date || '');
        time.textContent = formatDate(String(post.date || ''));
        const title = document.createElement('h3');
        title.textContent = String(post.title || '(제목 없음)');
        const summary = document.createElement('p');
        summary.textContent = String(post.summary || '');
        const more = document.createElement('span');
        more.className = 'latest-story-more';
        more.append(document.createTextNode('이야기 읽기 '));
        const arrow = document.createElement('span');
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = '→';
        more.append(arrow);
        link.append(time, title, summary, more);
        card.append(link);
        latestStories.append(card);
      });
    })
    .catch(() => {
      latestStories.textContent = '최신 이야기를 불러오지 못했습니다. 블로그에서 글을 확인해 주세요.';
      latestStories.classList.add('story-load-error');
    });
}
