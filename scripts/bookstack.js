const markedModule = require('marked');

const BOOKSTACK_URL = process.env.BOOKSTACK_URL;
const API_TOKEN = process.env.BOOKSTACK_API_TOKEN;
const API_EMAIL = process.env.BOOKSTACK_API_EMAIL;

const payload = JSON.parse(process.env.GITHUB_EVENT_PAYLOAD || '{}');
const issue = payload.issue;

if (!issue) {
  console.log('No issue found in event payload');
  process.exit(0);
}

const title = issue.title;
const bodyMarkdown = issue.body || '';
const bodyHTML = markedModule.marked(bodyMarkdown);

const pageData = {
  name: title,
  html: `
    <h2>Проблема</h2>
    <p>${bodyHTML}</p>
    <h2>Ссылки</h2>
    <p><a href="${issue.html_url}">GitHub Issue</a></p>
  `,
  tags: ['github', 'issue']
};

// Функция для поиска страницы по title
async function findPageByTitle(title) {
  const response = await fetch(`${BOOKSTACK_URL}/api/pages?search=${encodeURIComponent(title)}`, {
   method: 'GET',
   headers: {
     'Authorization': `Token ${API_TOKEN},${API_EMAIL}`
  }
});


  if (!response.ok) {
    const text = await response.text();
    console.error('Error searching page:', text);
    return null;
  }

  const data = await response.json();
  if (data.length > 0) return data[0].id;
  return null;
}

// Функция для создания страницы
async function createPage() {
  const response = await fetch(`${BOOKSTACK_URL}/api/pages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${API_TOKEN},${API_EMAIL}`
    },
    body: JSON.stringify(pageData)
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Error creating page:', text);
  } else {
    console.log('Page created successfully!');
  }
}

// Функция для обновления страницы
async function updatePage(pageId) {
  const response = await fetch(`${BOOKSTACK_URL}/api/pages/${pageId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${API_TOKEN},${API_EMAIL}`
    },
    body: JSON.stringify(pageData)
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Error updating page:', text);
  } else {
    console.log('Page updated successfully!');
  }
}

// Основная логика
(async () => {
  const pageId = await findPageByTitle(title);

  if (pageId) {
    console.log(`Page exists (ID: ${pageId}), updating...`);
    await updatePage(pageId);
  } else {
    console.log('Page does not exist, creating new one...');
    await createPage();
  }
})();
