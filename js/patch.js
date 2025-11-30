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
                    
                    output.push('        }');
                });
                
            }
            
            
            return output.join('\n');
        };
        
    });
})();
