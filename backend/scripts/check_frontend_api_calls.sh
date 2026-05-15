#!/bin/bash
# Check frontend API calls for delete operations

echo "======================================================================"
echo "🔍 CHECKING FRONTEND DELETE API CALLS"
echo "======================================================================"
echo ""

echo "📁 Checking adminCourseAPI.js..."
echo ""

if [ -f "FE_EduSync/src/services/adminCourseAPI.js" ]; then
    echo "✅ File exists"
    echo ""

    echo "🔍 Looking for delete functions:"
    echo ""
    grep -n "delete.*API\|export.*delete" FE_EduSync/src/services/adminCourseAPI.js
    echo ""

    echo "🔍 Looking for axios.delete calls:"
    echo ""
    grep -n "axios.delete" FE_EduSync/src/services/adminCourseAPI.js
    echo ""

    echo "📋 Full delete function(s):"
    echo ""
    grep -A 15 "export.*delete.*API" FE_EduSync/src/services/adminCourseAPI.js
    echo ""
else
    echo "❌ File not found!"
fi

echo "======================================================================"
echo "🔍 CHECKING EditCourse.jsx"
echo "======================================================================"
echo ""

if [ -f "FE_EduSync/src/pages/Admin/EditCourse.jsx" ]; then
    echo "✅ File exists"
    echo ""

    echo "🔍 Looking for removeVideo function:"
    echo ""
    grep -n "removeVideo\|deleteVideo\|deleteLesson" FE_EduSync/src/pages/Admin/EditCourse.jsx | head -10
    echo ""

    echo "🔍 Looking for import statements:"
    echo ""
    grep -n "import.*delete.*API\|import.*{.*delete" FE_EduSync/src/pages/Admin/EditCourse.jsx
    echo ""

    echo "📋 removeVideo function (first 20 lines):"
    echo ""
    grep -A 20 "const removeVideo.*=" FE_EduSync/src/pages/Admin/EditCourse.jsx | head -25
    echo ""
else
    echo "❌ File not found!"
fi

echo "======================================================================"
echo "📊 SUMMARY"
echo "======================================================================"
echo ""

echo "Check the output above for:"
echo "1. ✅ deleteVideoAPI or deleteLessonAPI function exists"
echo "2. ✅ Correct endpoint: /instructor/videos/{id} or /instructor/lessons/{id}"
echo "3. ✅ removeVideo calls the delete API"
echo "4. ✅ API is imported in EditCourse.jsx"
echo ""

echo "Common issues:"
echo "❌ Function exists but calls wrong endpoint"
echo "❌ Function not imported in component"
echo "❌ removeVideo only updates state, doesn't call API"
echo ""
