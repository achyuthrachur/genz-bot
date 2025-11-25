// script.js
// Frontend logic for Gen Jargon Translator with richer UI state.

document.addEventListener('DOMContentLoaded', () => {
  const inputText = document.getElementById('inputText');
  const modeSelect = document.getElementById('mode');
  const cringeInput = document.getElementById('cringe');
  const cringeValue = document.getElementById('cringeValue');
  const translateBtn = document.getElementById('translateBtn');
  const loading = document.getElementById('loading');
  const loadingText = document.getElementById('loadingText');
  const variantsDiv = document.getElementById('variants');
  const explanationsBlock = document.getElementById('explanationsBlock');
  const explanationsList = document.getElementById('explanations');
  const quickSuggestions = document.getElementById('quickSuggestions');

  const loadingMessages = [
    'Rewriting the vibe...',
    'Distilling corporate-ese...',
    'Adding sparkle and slang...',
    'Polishing for the boardroom...',
    'Letting Gen Z cook...',
    'Dialing up the charisma...',
    'Decluttering the cringe...'
  ];

  const boomerToGenZSuggestions = [
    "Per my last email, I wanted to follow up on the status of this request.",
    "Let's table this discussion and revisit it in next week's meeting.",
    "Please find the attached document for your review.",
    "I hope this message finds you well. I wanted to touch base on the project timeline.",
    "Let's take this offline and discuss it separately.",
    "Circling back on this to ensure we're aligned.",
    "Can you provide an update by end of day?",
    "We need to manage expectations with the stakeholders.",
    "Just a friendly reminder about our upcoming deadline.",
    "I'm not sure this initiative is the best use of our resources.",
    "Let's schedule a quick call to sync up.",
    "Thank you for your patience while we work through this issue.",
    "I have some concerns about the current approach.",
    "Please let me know if you have any questions or need clarification.",
    "We should prioritize this item for the next sprint.",
    "This proposal needs additional detail before we can move forward.",
    "I appreciate the effort, but we'll need to make a few revisions.",
    "Let's align on the key objectives before we proceed.",
    "We may need to adjust the timeline due to recent changes.",
    "Can you walk me through your thought process on this?",
    "This email serves as a confirmation of our conversation earlier today.",
    "I'm reaching out to follow up on our previous discussion.",
    "We're currently experiencing some unexpected challenges.",
    "Let's focus on quick wins to build momentum.",
    "I understand your perspective, but we need to consider the bigger picture.",
    "It would be helpful to get your feedback on this draft.",
    "Please keep me posted on any developments.",
    "We should escalate this issue to the appropriate team.",
    "This might require a phased approach rather than one big launch.",
    "I'm concerned we're overcommitting given our current bandwidth.",
    "Could you kindly provide more context around this request?",
    "Let's set some clear expectations for deliverables and timelines.",
    "I'm not sure that solution is scalable in the long term.",
    "Thanks for your prompt response and collaboration on this.",
    "Before we proceed, we should align with leadership.",
    "I'll defer to your expertise on the technical details.",
    "From a risk management perspective, we should reconsider this.",
    "Let's document the action items so nothing falls through the cracks.",
    "I'd like to schedule a retrospective once this project wraps up.",
    "Overall, this is headed in the right direction, but it needs some refinement."
  ];

  const genZToBoomerSuggestions = [
    "ngl this meeting was kinda mid, we didn't decide anything fr.",
    "highkey this deadline is wild, who thought this was realistic 💀",
    "this deck is pretty but the story is lowkey lost in the vibes.",
    "I opened Jira and immediately wanted to log off life.",
    "this project is giving group project energy where two people do everything.",
    "the backlog is in its flop era, half this stuff is never getting done.",
    "this bug woke up and chose violence.",
    "staging is acting feral, nothing's crashing but everything feels off.",
    "respectfully, this plan is not it.",
    "my brain is on 1% and we're pretending this sprint is normal.",
    "this doc started strong then went full 3am energy at the end.",
    "I simply will not be perceiving that ticket today.",
    "every time I check Slack, it's a new mini crisis speedrun.",
    "this feature is either galaxy brain or brain rot, no in-between.",
    "why is this UI kinda a serve though?",
    "this notification logic is in its clown era.",
    "I deployed once and now I'm speedrunning unemployment.",
    "this code reads like it was written during a vibes-only side quest.",
    "my inbox is just 47 'gentle pings' and my soul has left the chat.",
    "this requirement doc is a jumpscare.",
    "lowkey feel like we're just manifesting the roadmap at this point.",
    "this idea slaps but the execution is fighting for its life.",
    "the way this feature just ate…",
    "I fear the scope creep is undefeated.",
    "I opened the design file and it's giving 'what if we just did everything.'",
    "this sprint board looks like a boss fight.",
    "our communication style is giving chaotic group chat with no pinned message.",
    "someone really said 'quick sync' and booked a one-hour meeting.",
    "this hot take is room temperature at best.",
    "the comments on this doc are unhinged, we're all reading different stories.",
    "this deadline is pure main-character energy with zero realism.",
    "our process is in its experimentation era and not in a cute way.",
    "I love the ambition but the timeline is delulu.",
    "this task is giving 'could've been an email.'",
    "everyone's hyped but no one knows who's actually doing the work, it's wild.",
    "this rollout plan is vibes-based with no laws.",
    "I'm cooked, someone else needs to carry this quest.",
    "prod is one bad commit away from entering its villain arc.",
    "this meeting could be a Google Doc with comments, bestie.",
    "I opened the project plan and immediately chose denial."
  ];

  const SUGGESTION_COUNT = 8;

  function getRandomSubset(arr, count) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, Math.min(count, copy.length));
  }

  let loadingInterval = null;
  function startLoading() {
    let idx = Math.floor(Math.random() * loadingMessages.length);
    loadingText.textContent = loadingMessages[idx];
    loading.classList.remove('hidden');
    translateBtn.disabled = true;
    loadingInterval = setInterval(() => {
      idx = (idx + 1) % loadingMessages.length;
      loadingText.textContent = loadingMessages[idx];
    }, 650);
  }

  function stopLoading() {
    if (loadingInterval) {
      clearInterval(loadingInterval);
      loadingInterval = null;
    }
    loading.classList.add('hidden');
    translateBtn.disabled = false;
  }

  function renderSuggestions() {
    const mode = modeSelect.value;
    let pool = [];
    if (mode === 'old_to_young') {
      pool = boomerToGenZSuggestions;
    } else if (mode === 'young_to_old') {
      pool = genZToBoomerSuggestions;
    } else {
      pool = [...boomerToGenZSuggestions, ...genZToBoomerSuggestions];
    }
    const subset = getRandomSubset(pool, SUGGESTION_COUNT);
    quickSuggestions.innerHTML = '';
    subset.forEach(text => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = text;
      chip.addEventListener('click', () => {
        inputText.value = text;
        translate();
      });
      quickSuggestions.appendChild(chip);
    });
  }

  async function translate() {
    const text = inputText.value.trim();
    const mode = modeSelect.value;
    const max_cringe = parseFloat(cringeInput.value);

    if (!text) {
      alert('Please enter some text to translate.');
      return;
    }

    startLoading();
    variantsDiv.innerHTML = '';
    explanationsList.innerHTML = '';
    explanationsBlock.classList.add('hidden');

    try {
      const minDelay = new Promise(resolve => setTimeout(resolve, 1500));
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          mode,
          options: {
            max_cringe,
            include_explanations: true
          }
        })
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      await minDelay; // let loading messages cycle a bit
      const variants = data.variants || [];
      const explanations = data.explanations || [];

      if (variants.length === 0) {
        variantsDiv.innerHTML = '<p class="muted">No variants returned.</p>';
      } else {
        variants.forEach(v => {
          const card = document.createElement('div');
          card.className = 'variant-card';

          const label = document.createElement('div');
          label.className = 'variant-label';
          label.textContent = v.label || 'Variant';

          const textEl = document.createElement('p');
          textEl.textContent = v.text || '';

          card.appendChild(label);
          card.appendChild(textEl);
          variantsDiv.appendChild(card);
        });
      }

      if (explanations.length > 0) {
        explanationsBlock.classList.remove('hidden');
        explanations.forEach(ex => {
          const li = document.createElement('li');
          const original = ex.original ? `<strong>${ex.original}</strong> → ` : '';
          const translated = ex.translated ? `${ex.translated}: ` : '';
          li.innerHTML = `${original}${translated}${ex.note || ''}`;
          explanationsList.appendChild(li);
        });
      }
    } catch (err) {
      console.error(err);
      variantsDiv.innerHTML = '<p class="muted">Something went wrong. Please try again.</p>';
    } finally {
      stopLoading();
      renderSuggestions(); // refresh subset each time
    }
  }

  // Event wiring
  translateBtn.addEventListener('click', translate);
  modeSelect.addEventListener('change', renderSuggestions);
  cringeInput.addEventListener('input', () => {
    cringeValue.textContent = parseFloat(cringeInput.value).toFixed(1);
  });

  // Initialize UI
  renderSuggestions();
  cringeValue.textContent = parseFloat(cringeInput.value).toFixed(1);
});
