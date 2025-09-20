#!/bin/bash

# Script to fix the school validation issue in Registration component
# This script will automatically update your Register.jsx file

echo "🔧 Fixing Registration Component School Validation Issue..."

# Define the path to your Registration component
# Update this path to match your project structure
REGISTER_FILE="src/components/auth/Register.jsx"

# Check if file exists
if [ ! -f "$REGISTER_FILE" ]; then
    echo "❌ Error: Register.jsx file not found at $REGISTER_FILE"
    echo "Please update the REGISTER_FILE path in this script to match your project structure"
    exit 1
fi

echo "📂 Found registration file: $REGISTER_FILE"

# Create a backup
cp "$REGISTER_FILE" "$REGISTER_FILE.backup"
echo "💾 Created backup: $REGISTER_FILE.backup"

# Fix 1: Remove validation from hidden schoolId input
echo "🔧 Removing validation from hidden schoolId input..."
sed -i.tmp 's/required: !selectedSchool ? t('\''schoolRequired'\'') : false/\/\/ validation removed/' "$REGISTER_FILE"

# Fix 2: Add value binding to hidden inputs
echo "🔧 Adding proper value binding to hidden inputs..."
sed -i.tmp 's/type="hidden"/type="hidden"\n                  value={selectedSchool?._id || '\'''\''}/g' "$REGISTER_FILE"

# Fix 3: Remove the error display for schoolId
echo "🔧 Removing premature error display..."
sed -i.tmp '/errors\.schoolId &&/,/}/d' "$REGISTER_FILE"

# Fix 4: Update the nextStep function validation logic
echo "🔧 Updating nextStep validation logic..."

# Create a temporary file with the fixed nextStep function
cat > /tmp/nextStep_fix.js << 'EOF'
  const nextStep = async () => {
    let fieldsToValidate = [];
    
    if (step === 1) {
      fieldsToValidate = ['firstName', 'lastName', 'email', 'phone', 'role'];
    } else if (step === 2) {
      // FIXED: Don't validate schoolId in step 2, validate school selection instead
      
      if (watchedRole === 'student') {
        fieldsToValidate.push('level', 'grade', 'studentId');
      } else if (watchedRole === 'teacher') {
        fieldsToValidate.push('tscNumber');
      }
      
      // Validate other fields first
      const isValid = await trigger(fieldsToValidate);
      
      // Check if school is selected AFTER other validations
      if (!selectedSchool) {
        alert('Please search and select a school before proceeding.');
        return;
      }
      
      if (isValid) {
        setStep(step + 1);
      }
      return;
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };
EOF

# Replace the nextStep function in the file
# This uses a more complex sed operation to replace the entire function
awk '
/const nextStep = async \(\) => \{/ {
    print "  const nextStep = async () => {"
    print "    let fieldsToValidate = [];"
    print "    "
    print "    if (step === 1) {"
    print "      fieldsToValidate = [\"firstName\", \"lastName\", \"email\", \"phone\", \"role\"];"
    print "    } else if (step === 2) {"
    print "      // FIXED: Don\"t validate schoolId in step 2, validate school selection instead"
    print "      "
    print "      if (watchedRole === \"student\") {"
    print "        fieldsToValidate.push(\"level\", \"grade\", \"studentId\");"
    print "      } else if (watchedRole === \"teacher\") {"
    print "        fieldsToValidate.push(\"tscNumber\");"
    print "      }"
    print "      "
    print "      // Validate other fields first"
    print "      const isValid = await trigger(fieldsToValidate);"
    print "      "
    print "      // Check if school is selected AFTER other validations"
    print "      if (!selectedSchool) {"
    print "        alert(\"Please search and select a school before proceeding.\");"
    print "        return;"
    print "      }"
    print "      "
    print "      if (isValid) {"
    print "        setStep(step + 1);"
    print "      }"
    print "      return;"
    print "    }"
    print "    "
    print "    const isValid = await trigger(fieldsToValidate);"
    print "    if (isValid) {"
    print "      setStep(step + 1);"
    print "    }"
    print "  };"
    
    # Skip the original function
    in_function = 1
    brace_count = 1
    next
}

in_function && /\{/ { brace_count++ }
in_function && /\}/ { 
    brace_count--
    if (brace_count == 0) {
        in_function = 0
    }
    next
}

!in_function { print }
' "$REGISTER_FILE" > "$REGISTER_FILE.new"

# Replace the original file with the fixed version
mv "$REGISTER_FILE.new" "$REGISTER_FILE"

# Clean up temporary files
rm -f "$REGISTER_FILE.tmp"

echo "✅ Registration component has been fixed!"
echo ""
echo "📋 Changes made:"
echo "   1. Removed validation from hidden schoolId input"
echo "   2. Added proper value binding to hidden inputs" 
echo "   3. Removed premature error display"
echo "   4. Updated nextStep validation logic"
echo ""
echo "🔄 To test the fix:"
echo "   1. Start your development server: npm start"
echo "   2. Navigate to the registration page"
echo "   3. Fill out Step 1 and proceed to Step 2"
echo "   4. You should no longer see 'Please select a school' error immediately"
echo ""
echo "🔙 To revert changes if needed:"
echo "   mv $REGISTER_FILE.backup $REGISTER_FILE"
echo ""
echo "🎉 Fix completed successfully!"
