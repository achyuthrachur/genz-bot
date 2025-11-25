// script.js
// Frontend logic for Gen Jargon Translator.
//
// Implements:
// - On DOMContentLoaded, wires up #translateBtn.
// - On click:
//   - Reads #inputText, #mode, #cringe.
//   - POSTs to /api/translate with JSON body.
//   - Shows #loading while waiting.
//   - Renders "variants" as cards in #variants.
//   - Renders explanations (if any) as list items in #explanations.
//   - Handles fetch or server errors gracefully.

document.addEventListener('DOMContentLoaded', () => {
  const inputText = document.getElementById('inputText');
  const modeSelect = document.getElementById('mode');
  const cringeInput = document.getElementById('cringe');
  const translateBtn = document.getElementById('translateBtn');
  const loading = document.getElementById('loading');
  const variantsDiv = document.getElementById('variants');
  const explanationsTitle = document.getElementById('explanationsTitle');
  const explanationsList = document.getElementById('explanations');

  function setLoading(isLoading) {
    loading.classList.toggle('hidden', !isLoading);
    translateBtn.disabled = isLoading;
  }

  translateBtn.addEventListener('click', async () => {
    const text = inputText.value.trim();
    const mode = modeSelect.value;
    const max_cringe = parseFloat(cringeInput.value);

    if (!text) {
      alert('Please enter some text to translate.');
      return;
    }

    setLoading(true);
    variantsDiv.innerHTML = '';
    explanationsList.innerHTML = '';
    explanationsTitle.classList.add('hidden');

    try {
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
      const variants = data.variants || [];
      const explanations = data.explanations || [];

      if (variants.length === 0) {
        variantsDiv.innerHTML = '<p>No variants returned.</p>';
      } else {
        variants.forEach(v => {
          const card = document.createElement('div');
          card.className = 'variant-card';

          const label = document.createElement('h4');
          label.textContent = v.label || 'Variant';

          const textEl = document.createElement('p');
          textEl.textContent = v.text || '';

          card.appendChild(label);
          card.appendChild(textEl);
          variantsDiv.appendChild(card);
        });
      }

      if (explanations.length > 0) {
        explanationsTitle.classList.remove('hidden');
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
      variantsDiv.innerHTML = '<p>Something went wrong. Please try again.</p>';
    } finally {
      setLoading(false);
    }
  });
});
