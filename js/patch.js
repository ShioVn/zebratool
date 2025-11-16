(function() {
    'use strict';
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPatch);
    } else {
        initPatch();
    }
    
    function initPatch() {
        const generateBtn = document.getElementById('generateBtn');
        if (!generateBtn) {
            console.warn('Generate button not found');
            return;
        }
        
        addCharacterToggle();
        
        function checkAnyDiscConfigured() {
            let hasAnyDisc = false;
            
            for (let i = 0; i < 6; i++) {
                const mainSelect = document.getElementById(`mainPropertySelect${i}`);
                
                if (mainSelect && mainSelect.value && mainSelect.selectedIndex > 0) {
                    hasAnyDisc = true;
                    break;
                }
            }
            
            const allSet4 = document.getElementById('allSet4');
            const allSet2 = document.getElementById('allSet2');
            if (allSet4 && allSet2) {
                if ((allSet4.value && allSet4.selectedIndex > 0) || 
                    (allSet2.value && allSet2.selectedIndex > 0)) {
                    hasAnyDisc = true;
                }
            }
            
            return hasAnyDisc;
        }
        
        function updateGenerateButton() {
            const hasDisc = checkAnyDiscConfigured();
            generateBtn.disabled = !hasDisc;
            
            if (hasDisc) {
                generateBtn.classList.remove('bg-gray-600');
                generateBtn.classList.add('bg-blue-600', 'hover:bg-blue-700', 'cursor-pointer');
            } else {
                generateBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700', 'cursor-pointer');
                generateBtn.classList.add('bg-gray-600');
            }
        }
        
        function addCharacterToggle() {
            const outputSection = document.querySelector('.bg-gray-800.p-6.rounded-lg.shadow-lg.mt-6');
            if (!outputSection) return;
            
            const h2 = outputSection.querySelector('h2');
            if (!h2) return;
            
            if (document.getElementById('excludeCharToggle')) return;
            
            const toggleDiv = document.createElement('div');
            toggleDiv.className = 'mb-4 flex items-center gap-2';
            toggleDiv.innerHTML = `
                <input type="checkbox" id="excludeCharToggle" class="w-4 h-4">
                <label for="excludeCharToggle" class="text-sm text-gray-300 cursor-pointer">
                    Only export discs (exclude character & weapon info)
                </label>
            `;
            
            h2.parentNode.insertBefore(toggleDiv, h2.nextSibling);
        }
        
        generateBtn.addEventListener('click', function(e) {
            setTimeout(() => {
                const excludeChar = document.getElementById('excludeCharToggle');
                const outputText = document.getElementById('outputText');
                
                if (excludeChar && excludeChar.checked && outputText && outputText.value) {
                    outputText.value = filterCharacterInfo(outputText.value);
                }
            }, 100);
        });
        
        function filterCharacterInfo(text) {
            const equipmentIndex = text.indexOf('.equipment');
            if (equipmentIndex === -1) return text;
            
            let result = text.substring(equipmentIndex);
            
            let braceCount = 0;
            let endIndex = -1;
            let startCounting = false;
            
            for (let i = 0; i < result.length; i++) {
                const char = result[i];
                
                if (!startCounting && result.substring(i, i+4) === '= .{') {
                    startCounting = true;
                    braceCount = 1;
                    i += 3; 
                    continue;
                }
                
                if (startCounting) {
                    if (char === '{') braceCount++;
                    if (char === '}') braceCount--;
                    
                    if (braceCount === 0) {
                        endIndex = i + 1;
                        break;
                    }
                }
            }
            
            if (endIndex !== -1) {
                result = result.substring(0, endIndex);
                result = result.trimEnd();
                if (result.endsWith(',')) {
                    result = result.slice(0, -1);
                }
            }
            
            return result;
        }
        
        for (let i = 0; i < 6; i++) {
            const mainSelect = document.getElementById(`mainPropertySelect${i}`);
            if (mainSelect) {
                mainSelect.addEventListener('change', updateGenerateButton);
            }
        }
        
        const allSet4 = document.getElementById('allSet4');
        const allSet2 = document.getElementById('allSet2');
        if (allSet4) allSet4.addEventListener('change', updateGenerateButton);
        if (allSet2) allSet2.addEventListener('change', updateGenerateButton);
        
        const avatarContainer = document.getElementById('avatarSelectContainer');
        const weaponContainer = document.getElementById('weaponSelectContainer');
        
        if (avatarContainer) {
            const observer = new MutationObserver(updateGenerateButton);
            observer.observe(avatarContainer, { childList: true, subtree: true });
        }
        
        if (weaponContainer) {
            const observer = new MutationObserver(updateGenerateButton);
            observer.observe(weaponContainer, { childList: true, subtree: true });
        }
        
        setTimeout(updateGenerateButton, 500);
        
        console.log('✅ Patch applied: Generate button now works with partial disc configuration');
        console.log('✅ Added option to exclude character info from output');
    }
})();

