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
    'Please review the attached deck at your earliest convenience.',
    'Let’s circle back on this after the meeting.',
    'I appreciate your patience as we resolve this issue.',
    'This proposal needs more budget alignment.',
    'Please keep me posted on any blockers.',
    'We should schedule a follow-up call next week.',
    'Let’s take this offline.',
    'Kindly find attached the revised document.',
    'Please provide a status update by EOD.',
    'We need to set expectations with the client.',
    'Let’s align on priorities for this sprint.',
    'The timeline is aggressive; we may need more resources.',
    'Please obtain stakeholder sign-off.',
    'Let’s brainstorm solutions in tomorrow’s standup.',
    'Please escalate if you hit any critical issues.',
    'Let’s discuss risks and mitigations.',
    'Please be proactive with communication.',
    'We should optimize the process for efficiency.',
    'Kindly send a summary of action items.',
    'Let’s ensure we stay within scope.',
    'Please confirm receipt of this email.',
    'The deliverable needs polish before shipping.',
    'Let’s tighten the messaging on this announcement.',
    'Please double-check the numbers before sharing.',
    'We need to manage expectations with leadership.',
    'Let’s revisit the roadmap for dependencies.',
    'Please avoid scope creep on this feature.',
    'Kindly share the meeting agenda in advance.',
    'Let’s schedule a retrospective after launch.',
    'Please provide a concise executive summary.',
    'We should document the lessons learned.',
    'Let’s avoid unnecessary churn in the plan.',
    'Please secure approvals before proceeding.',
    'We need a more data-driven approach.',
    'Let’s minimize back-and-forth with clearer requirements.',
    'Please clarify ownership for each task.',
    'We need to re-baseline the schedule.',
    'Let’s ensure QA has enough time.',
    'Please keep communication transparent with stakeholders.',
    'Let’s formalize the handoff process.'
  ];

  const genZToBoomerSuggestions = [
    'Bruh this rollout is kind of mid, not gonna lie.',
    'That email was giving zero chill.',
    'Can we vibe check this plan before we ship?',
    'Low-key this timeline is wild.',
    'ngl the last release was mid.',
    'This deck needs more drip.',
    'The design slaps but perf is sus.',
    'Squad is heads down grinding fr.',
    'This feature is goated if we ship it clean.',
    'We need a sanity check before it ships.',
    'Stakeholders were big mad on the call.',
    'The meeting was a whole snoozefest.',
    'The docs are a little sus rn.',
    'Can we get receipts on that data?',
    'This bug is cooking my brain.',
    'The dashboard is low-key bussin.',
    'We’re on the struggle bus with auth.',
    'Product wants extra sprinkles on top.',
    'That hotfix was clutch ngl.',
    'Timeline is brutal, we need backup.',
    'This copy is giving corporate cringe.',
    'QA found some spicy edge cases.',
    'Can we chill with the scope creep?',
    'That KPI is cap without better data.',
    'The API is moving kinda sus today.',
    'Design wants to add more sparkle.',
    'This sprint is already stacked.',
    'Can we not ship vibes-only testing?',
    'The error message is yelling at users.',
    'This is fine.gif energy right now.',
    'The team is cooking, let them cook.',
    'These meetings are not the vibe.',
    'Deploy broke and everyone panicked.',
    'This feature is extra but kinda fun.',
    'Can we get a TL;DR before the call?',
    'Low-key need a nap after that retro.',
    'The timeline feels cursed rn.',
    'This toolchain is doing the most.',
    'Auth is acting feral again.',
    'The cache is gaslighting us.'
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
