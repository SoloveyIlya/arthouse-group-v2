#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import site
site.addsitedir('/Users/evgenijskackov/Library/Python/3.12/site-packages')
from pypdf import PdfReader
import json
import re

reader = PdfReader('Glamni-Model configuration sheet-V1.pdf')
full_text = ''
for page in reader.pages:
    full_text += page.extract_text() + '\n\n'

models = {}
lines = full_text.split('\n')

current_model = None
skip_models = ['G30', 'G50']

def clean_text(text):
    """Удаляет специальные символы"""
    return re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text).strip()

# Парсим модели
for i, line in enumerate(lines):
    line_clean = clean_text(line)
    
    # Находим модель
    if re.search(r'Model:\s*([A-Z]\d+)', line_clean):
        match = re.search(r'Model:\s*([A-Z]\d+)', line_clean)
        if match:
            current_model = match.group(1)
            if current_model not in skip_models:
                models[current_model] = {
                    'size': '',
                    'floor_area': '',
                    'guests': '',
                    'power': '',
                    'weight': '',
                    'external_protection': [],
                    'guest_control': [],
                    'accessories': [],
                    'interior': [],
                    'optional': []
                }
    
    if not current_model or current_model in skip_models:
        continue
    
    # Size (следующая строка после "Size(L*W*H):")
    if 'Size(L*W*H):' in line_clean and i+1 < len(lines):
        size_line = clean_text(lines[i+1])
        if size_line and '*' in size_line:
            models[current_model]['size'] = size_line
    
    # Floor Area
    if 'Floor' in line_clean and 'Area:' in line_clean:
        area_match = re.search(r'Area:\s*([\d.]+)', line_clean)
        if area_match:
            models[current_model]['floor_area'] = area_match.group(1) + '㎡'
    
    # Number of guests
    if 'Number' in line_clean and 'guests:' in line_clean:
        guests_match = re.search(r'guests:\s*([\d-]+)', line_clean)
        if guests_match:
            models[current_model]['guests'] = guests_match.group(1) + ' people'
    
    # Maximum Power
    if 'Maximum' in line_clean and 'Power:' in line_clean:
        power_match = re.search(r'Power:\s*([^\n]+)', line_clean)
        if power_match:
            power_val = clean_text(power_match.group(1))
            models[current_model]['power'] = power_val
    
    # Total Net Weight
    if 'Total' in line_clean and 'Net' in line_clean and 'Weight:' in line_clean:
        weight_match = re.search(r'Weight:\s*([^\n]+)', line_clean)
        if weight_match:
            weight_val = clean_text(weight_match.group(1))
            models[current_model]['weight'] = weight_val

# Извлекаем системы из текста (упрощенная версия)
# Для каждой модели ищем секции в тексте
for model_id, model_data in models.items():
    # Ищем модель в тексте
    model_pattern = f'Model:\\s*{model_id}'
    model_match = None
    for i, line in enumerate(lines):
        if re.search(model_pattern, clean_text(line)):
            model_match = i
            break
    
    if model_match:
        # Извлекаем текст до следующей модели или конца документа
        end_match = None
        for i in range(model_match + 1, len(lines)):
            if i < len(lines) and re.search(r'Model:\\s*([A-Z]\d+)', clean_text(lines[i])):
                end_match = i
                break
        
        if end_match:
            model_text = '\n'.join([clean_text(l) for l in lines[model_match:end_match]])
        else:
            model_text = '\n'.join([clean_text(l) for l in lines[model_match:]])
        
        # Парсим системы
        if 'External protection system' in model_text:
            start = model_text.find('External protection system')
            end = model_text.find('Guest control system', start)
            if end == -1:
                end = model_text.find('Product accessories', start)
            if end == -1:
                end = len(model_text)
            protection_text = model_text[start:end]
            # Извлекаем пункты
            protection_items = []
            for item in ['Galvanized steel structure frame system',
                        'Fluorocarbon sprayed aluminum alloy shell module',
                        'Thermal insulation, waterproof and moisture-proof structural system',
                        'Three-layer hollow tempered floor-to-ceiling glass',
                        'Standard swing entrance door',
                        'Hollow laminated tempered glass skylight']:
                if item.lower() in protection_text.lower():
                    protection_items.append(item)
            models[model_id]['external_protection'] = protection_items if protection_items else ['Galvanized steel structure frame system', 'Fluorocarbon sprayed aluminum alloy shell module', 'Thermal insulation, waterproof and moisture-proof structural system', 'Three-layer hollow tempered floor-to-ceiling glass', 'Standard swing entrance door']
        
        if 'Guest control system' in model_text:
            guest_items = []
            for item in ['Lighting / Electric curtains',
                        'Intelligent access control system for hotels',
                        'Smart Voice System']:
                if item.lower() in model_text.lower():
                    guest_items.append(item)
            models[model_id]['guest_control'] = guest_items if guest_items else ['Lighting / Electric curtains', 'Intelligent access control system for hotels']
        
        if 'Product accessories' in model_text:
            acc_items = []
            for item in ['Support feet matched at the bottom of the product',
                        'Lifting rings / Transportation fixtures']:
                if item.lower() in model_text.lower():
                    acc_items.append(item)
            models[model_id]['accessories'] = acc_items if acc_items else ['Support feet matched at the bottom of the product', 'Lifting rings / Transportation fixtures']
        
        if 'Interior Decoration' in model_text:
            interior_items = []
            for item in ['Integrated Ceiling and Wall Modules',
                        'Stone Crystal Wood-Grain Flooring',
                        'Bathroom Privacy Glass Door',
                        'Bathroom Shower Room/Marble/Tile Floor',
                        'Washbasin Counter/Sink/Bathroom Mirror',
                        'Coat Hooks/Shower Storage Shelf/Towel Rack',
                        'Branded Water Tap/Showerhead/Floor Drain',
                        'Whole-House Lighting System',
                        'Whole-House Water and Electricity System',
                        'Standard Color Blackout Curtains',
                        'Air Conditioner (Cooling & Heating)',
                        'Electric Water Heater',
                        'Ventilation System',
                        'Whole-House Mosquito-Proof Screen Doors',
                        '4-in-1 bathroom ceiling heater with light, heat, ventilation, and fan',
                        'Branded Smart Toilet',
                        'Electric Underfloor Heating']:
                if item.lower() in model_text.lower():
                    interior_items.append(item)
            models[model_id]['interior'] = interior_items if interior_items else ['Integrated Ceiling and Wall Modules', 'Stone Crystal Wood-Grain Flooring', 'Bathroom Privacy Glass Door', 'Bathroom Shower Room/Marble/Tile Floor']
        
        # Optional Configurations
        if 'Optional Configurations' in model_text or 'Additional Costs Apply' in model_text:
            optional_items = []
            if 'UV-resistant Heat-insulating' in model_text or 'Explosion-proof Film' in model_text:
                optional_items.append('UV-resistant Heat-insulating Explosion-proof Film (High-transparency/Privacy)')
            if 'Thickened Insulation Layer' in model_text:
                optional_items.append('Thickened Insulation Layer')
            if 'Smart Voice System' in model_text or 'Smart voice system' in model_text:
                optional_items.append('Smart Voice System')
            if 'Starry Sky Skylight' in model_text or 'starry sky' in model_text.lower():
                optional_items.append('Starry Sky Skylight')
            if 'Projector' in model_text:
                optional_items.append('Projector + projection screen')
            if 'Custom bar counter' in model_text.lower() or 'Custom wardrobe' in model_text.lower():
                optional_items.append('Custom bar counter / Custom wardrobe')
            if 'Entrance Staircase' in model_text:
                optional_items.append('Entrance Staircase')
            if 'Triangular V-brace' in model_text:
                optional_items.append('Triangular V-brace')
            if 'Entrance Platform' in model_text:
                optional_items.append('Entrance Platform')
            if 'Kitchen Cabinets' in model_text or 'International Kitchen' in model_text:
                optional_items.append('International Kitchen Integrated Customization')
            
            models[model_id]['optional'] = list(set(optional_items))  # Убираем дубликаты

print(json.dumps(models, indent=2, ensure_ascii=False))

