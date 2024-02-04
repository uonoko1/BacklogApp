import React from 'react';

interface DescriptionProps {
    description: string;
}

const Description = ({ description }: DescriptionProps) => {
    const lines = description.split('\n');
    let inList = false;
    let inP = false;
    let currentItem: any = [];
    const content: JSX.Element[] = [];
    let listItems: JSX.Element[] = [];
    let pItems: JSX.Element[] = [];
    const renderTextWithLinks = (text: string, index: number) => {
        const tldList = 'com|net|org|io|jp';
        const urlPattern = new RegExp(`(https?:\\/\\/)?([a-z0-9][a-z0-9\\-]*[a-z0-9]\\.)+(?:${tldList})(\\/[a-z0-9\\.\\-\\$&%/:=#~]*)?`, 'gi');

        const segments = [];
        let lastIndex = 0;
        let match;

        while ((match = urlPattern.exec(text)) !== null) {
            if (match.index > lastIndex) {
                segments.push(text.slice(lastIndex, match.index));
            }

            const url = match[0].startsWith('http') ? match[0] : `https://${match[0]}`;

            segments.push(<a href={url} target="_blank" rel="noopener noreferrer" key={`link-${index}-${lastIndex}`}>{match[0]}</a>);

            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < text.length) {
            segments.push(text.slice(lastIndex));
        }

        return segments;
    };

    lines.forEach((line, index) => {
        if (line.startsWith('- ')) {
            if (!inList) {
                inList = true;
                listItems = [];
            }
            if (currentItem.length > 0) {
                listItems.push(<li key={`li-${index - 1}`}>{currentItem}</li>);
                currentItem = [];
            }
            currentItem.push(<span key={`span-${index}`}>{line.substring(2)}</span>);
        } else if (inList) {
            if (line.trim() === '') {
                inList = false;
                listItems.push(<li key={`li-${index - 1}`}>{currentItem}</li>);
                content.push(<ul key={`ul-${index}`}>{listItems}</ul>);
                currentItem = [];
            } else {
                const lineContent = renderTextWithLinks(line, index);
                currentItem.push(<br key={`br-${index}`} />);
                currentItem.push(<span key={`line-${index}`}>{lineContent}</span>);
            }
        } else if (inP) {
            if (line.trim() === '') {
                inP = false;
                content.push(<p key={`p-${index}`}>{pItems}</p>);
                content.push(<br key={`br-${index}`} />);
                currentItem = [];
            } else {
                pItems.push(<br key={`br-${index}`} />)
                const lineContent = renderTextWithLinks(line, index);
                pItems.push(<span key={`p-${index}`}>{lineContent}</span>);
            }
        } else if (line.startsWith('# ')) {
            content.push(<h1 key={`h1-${index}`}>{line.substring(2)}</h1>);
        } else if (line.startsWith('## ')) {
            content.push(<h2 key={`h2-${index}`}>{line.substring(3)}</h2>);
        } else if (line.startsWith('### ')) {
            content.push(<h3 key={`h3-${index}`}>{line.substring(4)}</h3>);
        } else {
            if (!inP) {
                inP = true;
                pItems = [];
            }

            const lineContent = renderTextWithLinks(line, index);
            pItems.push(<span key={`p-${index}`}>{lineContent}</span>);
        }
    }
    );

    if (inList && currentItem.length > 0) {
        listItems.push(<li key={`li-last`}>{currentItem}</li>);
        content.push(<ul key={`ul-last`}>{listItems}</ul>);
    }

    if (inP && pItems.length > 0) {
        content.push(<p key={`p-last`}>{pItems}</p>);
    }

    return <div className='Description'>{content}</div>;
};

export default Description;