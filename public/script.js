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

  const suggestionsByMode = {
    old_to_young: [
      'Please review the attached deck at your earliest convenience.',
      'Let’s circle back on this after the meeting.',
      'I appreciate your patience as we resolve this issue.',
      'This proposal needs more budget alignment.'
    ],
    young_to_old: [
      'Bruh this rollout is kind of mid, not gonna lie.',
      'That email was giving zero chill.',
      'Can we vibe check this plan before we ship?',
      'Low-key this timeline is wild.'
    ],
    auto: [
      'Honestly, this meeting is somewhat mediocre, to be honest.',
      'This project is straight fire, everyone is hyped.',
      'We should probably sync up next week.',
      'ngl the last release was mid.'
    ]
  };

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
    const pool = suggestionsByMode[mode] || suggestionsByMode.auto;
    quickSuggestions.innerHTML = '';
    pool.forEach(text => {
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
