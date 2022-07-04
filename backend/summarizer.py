import networkx as nx
import numpy as np
from nltk.cluster.util import cosine_distance
from nltk.corpus import stopwords
import os


def sent_similarity(sent1, sent2, StopWords=None):
    if StopWords is None:
        StopWords = []
 
    sent1 = [w.lower() for w in sent1]
    sent2 = [w.lower() for w in sent2]
 
    all_words = list(set(sent1 + sent2))
 
    vect1 = [0] * len(all_words)
    vect2 = [0] * len(all_words)
 
    # vector of 1st sentence
    for w in sent1:
        if w in StopWords:
            continue
        vect1[all_words.index(w)] += 1
 
    # vector of 2nd sentence
    for w in sent2:
        if w in StopWords:
            continue
        vect2[all_words.index(w)] += 1
 
    return 1 - cosine_distance(vect1, vect2)


def similarity_matrix(sent, Stopwords):
    # Empty similarity matrix
    similarity_matrix = np.zeros((len(sent), len(sent)))
 
    for idx1 in range(len(sent)):
        for idx2 in range(len(sent)):
            if idx1 == idx2: #skip same sentences
                continue 
            similarity_matrix[idx1][idx2] = sent_similarity(sent[idx1], sent[idx2], Stopwords)

    return similarity_matrix


# get the text file
dir=os.path.dirname(__file__)
rel_path="./sample.txt"
abs_file_path=os.path.join(dir,rel_path)
f=open(abs_file_path,"r")

Stopwords = stopwords.words('english')
summarize_text = []

filedata = f.readlines()
article = filedata[0].split(". ")
sent = []

for s in article:
    # print(s)
    sent.append(s.replace("[^a-zA-Z]", " ").split(" "))
sent.pop() 

n=int((len(sent))*0.2)

# Generate Similary Martix of sentences
sent_similarity_martix = similarity_matrix(sent, Stopwords)

# get rank of sentences in similarity martix
sentence_similarity_graph = nx.from_numpy_array(sent_similarity_martix)
scores = nx.pagerank(sentence_similarity_graph)

# Sort the sentences
ranked_sent = sorted(((scores[i],s) for i,s in enumerate(sent)), reverse=True)    

for i in range(n):
    summarize_text.append(" ".join(ranked_sent[i][1]))

# Summary
print("Summary: \n", ". ".join(summarize_text))
