import os

files = [
    'frontend/src/app/page.tsx',
    'frontend/src/app/assets/page.tsx',
    'frontend/src/app/compliance/page.tsx',
    'frontend/src/app/graph/page.tsx'
]

for f in files:
    if os.path.exists(f):
        with open(f, 'r') as file:
            content = file.read()
        
        new_content = content.replace('className="flex h-screen w-full', 'className="flex flex-col md:flex-row h-screen w-full')
        
        with open(f, 'w') as file:
            file.write(new_content)
        print(f'Updated {f}')
