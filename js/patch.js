// Patch: Cho phép xuất config mà không cần đủ 6 đĩa và tùy chọn bỏ thông tin character
// Patch file to override generateConfig function with new format

(function() {
    'use strict';
    
    // Wait for the original functions to be loaded
    window.addEventListener('DOMContentLoaded', function() {
        // Override the generateConfig function
        window.generateConfig = function(avatar, weapon, discsData) {
            let output = [];
            
            // Equipment section (Discs)
            const validDiscs = discsData.filter(disc => 
                disc.disc_name && 
                disc.main_property && 
                disc.sub_properties.length > 0
            );
            
            if (validDiscs.length > 0) {
                
                validDiscs.forEach((disc, index) => {
                    const discSetId = dicsSet[disc.disc_name];
                    const discId = discSetId * 100 + (disc.slot + 1) + 40;
                    
                    output.push('        .{ // Slot ' + (disc.slot + 1));
                    output.push('            .id = ' + discId + ', // ' + (discSet_id2name[discSetId] || '') + ' [' + (disc.slot + 1) + ']');
                    output.push('            .level = 15,');
                    output.push('            .exp = 0,');
                    output.push('            .star = 1,');
                    output.push('            .lock = false,');
                    
                    // Main property
                    const mainPropId = dicsPropertyTypeId[disc.main_property];
                    const mainPropValue = dicsPropertyType[mainPropId][1]; // base value for main stat
                    
                    output.push('            .properties = .{.{');
                    output.push('                .key = ' + mainPropId + ', // ' + disc.main_property);
                    output.push('                .base_value = ' + mainPropValue + ',');
                    output.push('                .add_value = 0,');
                    output.push('            }},');
                    
                    // Sub properties
                    output.push('            .sub_properties = .{');
                    disc.sub_properties.forEach(([propName, level]) => {
                        const subPropId = dicsPropertyTypeId[propName];
                        const subPropValue = dicsPropertyType[subPropId][2]; // base value for sub stat
                        
                        output.push('                .{');
                        output.push('                    .key = ' + subPropId + ', // ' + propName);
                        output.push('                    .base_value = ' + subPropValue + ',');
                        output.push('                    .add_value = ' + level + ',');
                        output.push('                },');
                    });
                    output.push('            },');
                    
                    output.push('        },');
                });
                
            }
            
            
            return output.join('\n');
        };
        
    });
})();

(function() {
    'use strict';
    
    // Đợi DOM load xong
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
        
        // Thêm checkbox option để bỏ character info
        addCharacterToggle();
        
        // LOGIC 1: Kiểm tra xem có ít nhất 1 đĩa được config không
        function checkAnyDiscConfigured() {
            let hasAnyDisc = false;
            
            // Duyệt qua 6 đĩa (I-VI)
            for (let i = 0; i < 6; i++) {
                const mainSelect = document.getElementById(`mainPropertySelect${i}`);
                
                // Nếu main property đã được chọn (không phải option rỗng đầu tiên)
                if (mainSelect && mainSelect.value && mainSelect.selectedIndex > 0) {
                    hasAnyDisc = true;
                    break;
                }
            }
            
            // Kiểm tra tab ALL
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
        
        // LOGIC 2: Enable/Disable button Generate dựa vào việc có đĩa nào được chọn
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
        
        // LOGIC 3: Thêm checkbox để toggle character info
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
        
        // LOGIC 4: Hook vào sự kiện generate để xử lý output
        generateBtn.addEventListener('click', function(e) {
            setTimeout(() => {
                const excludeChar = document.getElementById('excludeCharToggle');
                const outputText = document.getElementById('outputText');
                
                if (excludeChar && excludeChar.checked && outputText && outputText.value) {
                    outputText.value = filterCharacterInfo(outputText.value);
                }
            }, 100);
        });
        
        // LOGIC 5: Lọc bỏ thông tin character, chỉ giữ lại equipment (bỏ header)
        function filterCharacterInfo(text) {
            // Tìm vị trí ".equipment = .{" 
            const equipmentIndex = text.indexOf('.equipment');
            if (equipmentIndex === -1) return text;
            
            // Tìm vị trí ".{0," trong equipment
            const slot0Index = text.indexOf('.{0,', equipmentIndex);
            if (slot0Index === -1) return text;
            
            // Bắt đầu từ sau ".{0,"
            let startIndex = slot0Index + 4; // Độ dài của ".{0,"
            
            // Tìm dấu .{ đầu tiên sau .{0, (đây là bắt đầu của disc thực sự)
            let discStartIndex = text.indexOf('.{', startIndex);
            if (discStartIndex === -1) return text;
            
            // Đếm dấu ngoặc từ vị trí disc bắt đầu
            let braceCount = 1; // Bắt đầu với .{ đầu tiên
            let endIndex = -1;
            
            for (let i = discStartIndex + 2; i < text.length; i++) {
                const char = text[i];
                const nextChar = text[i + 1];
                
                // Kiểm tra .{ (mở)
                if (char === '.' && nextChar === '{') {
                    braceCount++;
                    i++; // Skip ký tự tiếp theo
                    continue;
                }
                
                // Kiểm tra }, (đóng)
                if (char === '}') {
                    braceCount--;
                    
                    // Khi braceCount = 0, ta đã đóng hết ngoặc của disc
                    if (braceCount === 0) {
                        // Tìm dấu }, để bao gồm cả nó
                        if (nextChar === ',') {
                            endIndex = i + 2;
                        } else {
                            endIndex = i + 1;
                        }
                        break;
                    }
                }
            }
            
            if (endIndex === -1) return text;
            
            // Lấy phần disc (từ .{ đến },)
            let result = text.substring(discStartIndex, endIndex).trim();
            
            // Loại bỏ dấu phụ thừa
            if (result.endsWith(',')) {
                result = result.slice(0, -1);
            }
            
            return result;
        }
        
        // LOGIC 6: Lắng nghe sự kiện thay đổi để cập nhật button
        // Lắng nghe thay đổi main property của từng đĩa
        for (let i = 0; i < 6; i++) {
            const mainSelect = document.getElementById(`mainPropertySelect${i}`);
            if (mainSelect) {
                mainSelect.addEventListener('change', updateGenerateButton);
            }
        }
        
        // Lắng nghe thay đổi tab ALL
        const allSet4 = document.getElementById('allSet4');
        const allSet2 = document.getElementById('allSet2');
        if (allSet4) allSet4.addEventListener('change', updateGenerateButton);
        if (allSet2) allSet2.addEventListener('change', updateGenerateButton);
        
        // Lắng nghe khi có thay đổi trong avatar/weapon container (dùng MutationObserver)
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
        
        // Check ngay khi load
        setTimeout(updateGenerateButton, 500);
        
        console.log('✅ Patch applied: Generate button now works with partial disc configuration');
        console.log('✅ Added option to exclude character info from output');
    }
})();


