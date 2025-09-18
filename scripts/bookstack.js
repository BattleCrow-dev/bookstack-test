const fetch = require('node-fetch');
const marked = require('marked');

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
const bodyHTML = marked(bodyMarkdown);

const pageData = {
  name: title,
  html: `
    <h2>Проблема</h2>
    <p>${bodyHTML}</p>
    <h2>Ссылки</h2>
    <p><a href="${issue.html_url}">GitHub Issue</a></p>
  `,
  tags: ['github', 'issue'],
  book_id: 1
};

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

createPage();
